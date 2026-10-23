import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    DeleteExpenseRequest,
    RejectDeleteRequest,
)
from app.deps import get_current_user
from app.services.notification_service import record_notification

from pydantic import BaseModel

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

class PaginatedExpensesResponse(BaseModel):
    items: List[ExpenseResponse]
    total: int
    skip: int
    limit: int
    hasMore: bool

def _get_expense_created_timestamp(exp: dict) -> float:
    """Parse creation timestamp from createdAt ISO or fallback to exp_<millis> ID."""
    created_at = exp.get("createdAt") or exp.get("date")
    if created_at:
        try:
            clean = str(created_at).rstrip("Z")
            dt = datetime.fromisoformat(clean)
            return dt.timestamp()
        except Exception:
            pass
    exp_id = str(exp.get("_id", ""))
    if exp_id.startswith("exp_"):
        try:
            millis = int(exp_id.split("_")[1])
            return millis / 1000.0
        except Exception:
            pass
    return 0.0

@router.get("/paginated", response_model=PaginatedExpensesResponse)
async def list_expenses_paginated(
    propertyId: Optional[str] = None,
    skip: int = 0,
    limit: int = 15,
    current_user: dict = Depends(get_current_user),
):
    query = {"propertyId": propertyId} if propertyId else {}
    # Backward compatible soft-delete filter
    query["isDeleted"] = {"$nin": [True, "Y", "y"]}
    query["deleted"] = {"$nin": [True, "Y", "y"]}

    total = await get_db().expenses.count_documents(query)
    docs = await get_db().expenses.find(query).sort("createdAt", -1).skip(skip).to_list(limit)
    res = []
    for e in docs:
        if e.get("isDeleted") is True or e.get("deleted") in [True, "Y", "y"]:
            continue
        e_date = e.get("date") or e.get("createdAt") or ""
        e_created = e.get("createdAt") or e.get("date") or ""
        e["date"] = e_date
        e["createdAt"] = e_created
        res.append(ExpenseResponse(id=e["_id"], **e))
    return PaginatedExpensesResponse(
        items=res,
        total=total,
        skip=skip,
        limit=limit,
        hasMore=(skip + len(res)) < total,
    )

@router.get("", response_model=List[ExpenseResponse])
async def list_expenses(
    propertyId: Optional[str] = None,
    skip: int = 0,
    limit: int = 500,
    current_user: dict = Depends(get_current_user),
):
    query = {"propertyId": propertyId} if propertyId else {}
    # Backward compatible soft-delete filter
    query["isDeleted"] = {"$nin": [True, "Y", "y"]}
    query["deleted"] = {"$nin": [True, "Y", "y"]}

    docs = await get_db().expenses.find(query).sort("createdAt", -1).skip(skip).to_list(limit if limit > 0 else 500)
    res = []
    for e in docs:
        if e.get("isDeleted") is True or e.get("deleted") in [True, "Y", "y"]:
            continue
        e_date = e.get("date") or e.get("createdAt") or ""
        e_created = e.get("createdAt") or e.get("date") or ""
        e["date"] = e_date
        e["createdAt"] = e_created
        res.append(ExpenseResponse(id=e["_id"], **e))
    return res

@router.post("", response_model=ExpenseResponse)
async def create_expense(payload: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.utcnow().isoformat() + "Z"
    actor_name = current_user.get("name") or payload.payerName or "Manager"
    actor_id = current_user.get("id") or current_user.get("_id") or payload.paidBy

    amount = round(float(payload.amount), 2)
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expense amount must be greater than zero.",
        )
    if not payload.splitAmong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expense must be split among at least one manager.",
        )

    initial_audit = [{
        "action": "Created expense",
        "actorId": actor_id,
        "actorName": actor_name,
        "timestamp": now,
    }]

    dump = payload.model_dump()
    dump["amount"] = amount
    dump["sharePerPerson"] = round(amount / len(payload.splitAmong), 2)
    if not dump.get("auditLog"):
        dump["auditLog"] = initial_audit

    exp_date = (payload.date or "").strip() or now
    exp = {
        "_id": f"exp_{int(time.time()*1000)}",
        **dump,
        "date": exp_date,
        "createdAt": now,
    }
    await get_db().expenses.insert_one(exp)

    # Record notification for all property co-managers
    await record_notification(
        property_id=exp.get("propertyId"),
        title="New Expense Added",
        body=f"{actor_name} logged '{exp.get('title')}' for ₹{amount:,.2f}",
        actor_id=actor_id,
        actor_name=actor_name,
        notif_type="expense_created",
        data={"expenseId": exp["_id"], "amount": exp.get("amount")},
    )

    return ExpenseResponse(id=exp["_id"], **exp)

@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    payload: ExpenseUpdate,
    current_user: dict = Depends(get_current_user),
):
    existing = await get_db().expenses.find_one({"_id": expense_id})
    if not existing or existing.get("isDeleted") is True or existing.get("deleted") in [True, "Y", "y"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found or has been deleted.")

    if existing.get("deleteStatus") == "pending_approval":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This expense has a pending deletion request and cannot be edited. Approve, reject, or cancel the deletion request first.",
        )

    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_name = current_user.get("name") or "Manager"
    now = datetime.utcnow().isoformat() + "Z"

    paid_by = str(existing.get("paidBy", ""))
    is_creator = (user_id == paid_by)

    # Permission check: amount editing is strictly restricted to the creator
    if payload.amount is not None:
        new_amount = round(float(payload.amount), 2)
        if new_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expense amount must be greater than zero.",
            )
        old_amount = round(float(existing.get("amount", 0)), 2)
        if old_amount != new_amount:
            if not is_creator:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the manager who logged this expense can edit the amount.",
                )

    # Permission check: notes editing is also strictly restricted to the creator
    if payload.notes is not None:
        new_notes = payload.notes.strip()
        old_notes = (existing.get("notes") or "").strip()
        if new_notes != old_notes and not is_creator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the manager who logged this expense can edit notes.",
            )

    # Permission check: date editing is strictly restricted to the creator
    if payload.date is not None:
        new_date = payload.date.strip()
        old_date = (existing.get("date") or "").strip()
        if new_date != old_date and not is_creator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the manager who logged this expense can edit the date.",
            )

    audit_log = list(existing.get("auditLog") or [])
    # If legacy expense has no creation entry, synthesize one
    if not audit_log:
        audit_log.append({
            "action": "Created expense",
            "actorId": str(existing.get("paidBy", "")),
            "actorName": existing.get("payerName") or "Manager",
            "timestamp": existing.get("createdAt") or existing.get("date") or now,
        })

    changed_items = []
    # Track updates & build audit log
    if payload.category and payload.category.strip() != existing.get("category"):
        old_cat = existing.get("category", "Uncategorized")
        new_cat = payload.category.strip()
        audit_log.append({
            "action": f"Category changed from '{old_cat}' to '{new_cat}'",
            "actorId": user_id,
            "actorName": user_name,
            "timestamp": now,
        })
        existing["category"] = new_cat
        changed_items.append(f"category to '{new_cat}'")

    if payload.title and payload.title.strip() != existing.get("title"):
        old_title = existing.get("title", "")
        new_title = payload.title.strip()
        audit_log.append({
            "action": f"Title changed from '{old_title}' to '{new_title}'",
            "actorId": user_id,
            "actorName": user_name,
            "timestamp": now,
        })
        existing["title"] = new_title
        changed_items.append(f"title to '{new_title}'")

    if payload.amount is not None:
        old_amount = round(float(existing.get("amount", 0)), 2)
        new_amount = round(float(payload.amount), 2)
        if old_amount != new_amount:
            audit_log.append({
                "action": f"Amount changed from ₹{old_amount:,.2f} to ₹{new_amount:,.2f}",
                "actorId": user_id,
                "actorName": user_name,
                "timestamp": now,
            })
            existing["amount"] = new_amount
            splits = existing.get("splitAmong", [])
            existing["sharePerPerson"] = round(new_amount / (len(splits) or 1), 2)
            changed_items.append(f"amount to ₹{new_amount:,.2f}")

    if payload.date is not None and is_creator:
        new_date = payload.date.strip()
        old_date = (existing.get("date") or "").strip()
        if new_date != old_date:
            audit_log.append({
                "action": f"Date changed from '{old_date[:10]}' to '{new_date[:10]}'",
                "actorId": user_id,
                "actorName": user_name,
                "timestamp": now,
            })
            existing["date"] = new_date
            changed_items.append("date")

    if payload.notes is not None and is_creator:
        new_notes = payload.notes.strip()
        old_notes = (existing.get("notes") or "").strip()
        if new_notes != old_notes:
            audit_log.append({
                "action": "Notes updated",
                "actorId": user_id,
                "actorName": user_name,
                "timestamp": now,
            })
            existing["notes"] = new_notes
            changed_items.append("notes")

    existing["auditLog"] = audit_log

    await get_db().expenses.update_one({"_id": expense_id}, {"$set": existing})

    if changed_items:
        desc = ", ".join(changed_items)
        await record_notification(
            property_id=existing.get("propertyId"),
            title="Expense Updated",
            body=f"{user_name} updated {desc} for '{existing.get('title')}'",
            actor_id=user_id,
            actor_name=user_name,
            notif_type="expense_updated",
            data={"expenseId": expense_id},
        )

    return ExpenseResponse(id=existing["_id"], **existing)

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    payload: Optional[DeleteExpenseRequest] = None,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete an expense with 5-minute grace period constraints:
    1) <= 5 mins from creation (or admin / sole manager): soft-deleted immediately.
    2) > 5 mins from creation: initiates a deletion approval request for other property co-managers.
    """
    db = get_db()
    exp = await db.expenses.find_one({"_id": expense_id})
    if not exp or exp.get("isDeleted") is True or exp.get("deleted") is True:
        raise HTTPException(status_code=404, detail="Expense not found or already deleted.")

    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_name = current_user.get("name") or "Manager"
    user_role = current_user.get("role", "user")

    prop_id = exp.get("propertyId")
    prop = await db.properties.find_one({"_id": prop_id}) if prop_id else None
    managers = [str(m) for m in (prop.get("managers") or [])] if prop else []

    is_payer = (str(exp.get("paidBy", "")) == user_id)
    is_manager = (user_id in managers)
    is_admin = (user_role == "admin")

    if not (is_payer or is_manager or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this expense.",
        )

    now_dt = datetime.utcnow()
    now_iso = now_dt.isoformat() + "Z"
    created_ts = _get_expense_created_timestamp(exp)
    elapsed_seconds = max(0.0, now_dt.timestamp() - created_ts)
    is_under_5_mins = (elapsed_seconds <= 300.0)

    other_managers = [m for m in managers if m != user_id]
    has_other_managers = len(other_managers) > 0

    reason = (payload.reason if payload else "") or "Wrong or test entry"

    # CASE 1: Under 5 mins from creation OR Admin OR Sole Manager of property
    if is_under_5_mins or is_admin or not has_other_managers:
        audit_entry = {
            "action": "Deleted expense (immediate)",
            "actorId": user_id,
            "actorName": user_name,
            "timestamp": now_iso,
            "notes": "Deleted within 5-minute grace window" if is_under_5_mins else "Direct manager deletion",
        }
        await db.expenses.update_one(
            {"_id": expense_id},
            {
                "$set": {
                    "isDeleted": True,
                    "deleted": True,
                    "deleteStatus": "deleted",
                    "deletedAt": now_iso,
                    "deletedBy": user_id,
                },
                "$push": {"auditLog": audit_entry},
            },
        )
        if prop_id:
            await record_notification(
                property_id=prop_id,
                title="Expense Deleted",
                body=f"{user_name} deleted '{exp.get('title')}' (₹{float(exp.get('amount', 0)):,.2f})",
                actor_id=user_id,
                actor_name=user_name,
                notif_type="expense_deleted",
                data={"expenseId": expense_id},
            )
        return {
            "success": True,
            "status": "deleted",
            "message": "Expense deleted successfully.",
            "expenseId": expense_id,
        }

    # CASE 2: Over 5 mins -> requires co-manager approval
    if exp.get("deleteStatus") == "pending_approval":
        raise HTTPException(
            status_code=400,
            detail="A deletion approval request is already pending for this expense.",
        )

    audit_entry = {
        "action": "Requested expense deletion",
        "actorId": user_id,
        "actorName": user_name,
        "timestamp": now_iso,
        "notes": reason,
    }
    await db.expenses.update_one(
        {"_id": expense_id},
        {
            "$set": {
                "deleteStatus": "pending_approval",
                "deleteRequestedBy": user_id,
                "deleteRequestedByName": user_name,
                "deleteRequestedAt": now_iso,
                "deleteReason": reason,
            },
            "$push": {"auditLog": audit_entry},
        },
    )

    if prop_id:
        await record_notification(
            property_id=prop_id,
            title="Expense Deletion Request",
            body=f"{user_name} requested approval to delete '{exp.get('title')}' (₹{float(exp.get('amount', 0)):,.2f})",
            actor_id=user_id,
            actor_name=user_name,
            notif_type="expense_delete_requested",
            data={"expenseId": expense_id, "reason": reason},
        )

    return {
        "success": True,
        "status": "pending_approval",
        "message": "Expense was logged over 5 minutes ago. A deletion approval request has been sent to other property managers.",
        "expenseId": expense_id,
    }

@router.patch("/{expense_id}/approve-delete")
async def approve_delete_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Co-manager approves a pending deletion request. Marks expense as soft-deleted.
    """
    db = get_db()
    exp = await db.expenses.find_one({"_id": expense_id})
    if not exp or exp.get("isDeleted") is True:
        raise HTTPException(status_code=404, detail="Expense not found or already deleted.")

    if exp.get("deleteStatus") != "pending_approval":
        raise HTTPException(status_code=400, detail="No pending deletion request found for this expense.")

    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_name = current_user.get("name") or "Manager"
    user_role = current_user.get("role", "user")

    if str(exp.get("deleteRequestedBy", "")) == user_id and user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot approve your own deletion request. Another property manager must approve it.",
        )

    prop_id = exp.get("propertyId")
    prop = await db.properties.find_one({"_id": prop_id}) if prop_id else None
    managers = [str(m) for m in (prop.get("managers") or [])] if prop else []

    if user_id not in managers and user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only co-managers of this property can approve expense deletions.",
        )

    now_iso = datetime.utcnow().isoformat() + "Z"
    audit_entry = {
        "action": "Approved expense deletion",
        "actorId": user_id,
        "actorName": user_name,
        "timestamp": now_iso,
        "notes": f"Approved deletion requested by {exp.get('deleteRequestedByName', 'Manager')}",
    }

    await db.expenses.update_one(
        {"_id": expense_id},
        {
            "$set": {
                "isDeleted": True,
                "deleted": True,
                "deleteStatus": "approved",
                "deletedAt": now_iso,
                "deletedBy": exp.get("deleteRequestedBy") or user_id,
                "deleteApprovedBy": user_id,
                "deleteApprovedByName": user_name,
            },
            "$push": {"auditLog": audit_entry},
        },
    )

    if prop_id:
        await record_notification(
            property_id=prop_id,
            title="Expense Deletion Approved",
            body=f"{user_name} approved deletion of '{exp.get('title')}' (₹{float(exp.get('amount', 0)):,.2f})",
            actor_id=user_id,
            actor_name=user_name,
            notif_type="expense_deleted",
            data={"expenseId": expense_id},
        )

    return {
        "success": True,
        "status": "deleted",
        "message": f"Expense '{exp.get('title')}' deletion approved and removed from active ledger.",
        "expenseId": expense_id,
    }

@router.patch("/{expense_id}/reject-delete")
async def reject_delete_expense(
    expense_id: str,
    payload: Optional[RejectDeleteRequest] = None,
    current_user: dict = Depends(get_current_user),
):
    """
    Co-manager rejects a pending deletion request. Expense remains active.
    """
    db = get_db()
    exp = await db.expenses.find_one({"_id": expense_id})
    if not exp or exp.get("isDeleted") is True:
        raise HTTPException(status_code=404, detail="Expense not found.")

    if exp.get("deleteStatus") != "pending_approval":
        raise HTTPException(status_code=400, detail="No pending deletion request found for this expense.")

    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_name = current_user.get("name") or "Manager"
    user_role = current_user.get("role", "user")

    prop_id = exp.get("propertyId")
    prop = await db.properties.find_one({"_id": prop_id}) if prop_id else None
    managers = [str(m) for m in (prop.get("managers") or [])] if prop else []

    if user_id not in managers and user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only co-managers of this property can reject expense deletions.",
        )

    now_iso = datetime.utcnow().isoformat() + "Z"
    reason = (payload.reason if payload else "") or "Rejected by co-manager"
    audit_entry = {
        "action": "Rejected expense deletion",
        "actorId": user_id,
        "actorName": user_name,
        "timestamp": now_iso,
        "notes": reason,
    }

    await db.expenses.update_one(
        {"_id": expense_id},
        {
            "$set": {
                "deleteStatus": "rejected",
                "deleteRejectedBy": user_id,
                "deleteRejectedByName": user_name,
                "deleteRejectionReason": reason,
            },
            "$push": {"auditLog": audit_entry},
        },
    )

    if prop_id:
        await record_notification(
            property_id=prop_id,
            title="Expense Deletion Rejected",
            body=f"{user_name} rejected the deletion request for '{exp.get('title')}': {reason}",
            actor_id=user_id,
            actor_name=user_name,
            notif_type="expense_delete_rejected",
            data={"expenseId": expense_id, "reason": reason},
        )

    return {
        "success": True,
        "status": "active",
        "message": f"Deletion request for '{exp.get('title')}' was rejected. The expense remains active.",
        "expenseId": expense_id,
    }

@router.patch("/{expense_id}/cancel-delete")
async def cancel_delete_request(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    The requester cancels their own pending deletion request.
    """
    db = get_db()
    exp = await db.expenses.find_one({"_id": expense_id})
    if not exp or exp.get("isDeleted") is True:
        raise HTTPException(status_code=404, detail="Expense not found.")

    if exp.get("deleteStatus") != "pending_approval":
        raise HTTPException(status_code=400, detail="No pending deletion request found for this expense.")

    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_name = current_user.get("name") or "Manager"
    user_role = current_user.get("role", "user")

    if str(exp.get("deleteRequestedBy", "")) != user_id and user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the user who requested deletion can cancel the request.",
        )

    now_iso = datetime.utcnow().isoformat() + "Z"
    audit_entry = {
        "action": "Cancelled expense deletion request",
        "actorId": user_id,
        "actorName": user_name,
        "timestamp": now_iso,
        "notes": "Cancelled by requester",
    }

    await db.expenses.update_one(
        {"_id": expense_id},
        {
            "$set": {
                "deleteStatus": None,
            },
            "$push": {"auditLog": audit_entry},
        },
    )

    return {
        "success": True,
        "status": "active",
        "message": "Deletion request cancelled. The expense remains active.",
        "expenseId": expense_id,
    }
