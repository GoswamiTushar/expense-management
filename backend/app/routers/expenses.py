import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.deps import get_current_user
from app.services.notification_service import record_notification

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("", response_model=List[ExpenseResponse])
async def list_expenses(propertyId: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"propertyId": propertyId} if propertyId else {}
    docs = await get_db().expenses.find(query).sort("createdAt", -1).to_list(500)
    res = []
    for e in docs:
        e_date = e.get("date") or e.get("createdAt") or ""
        e_created = e.get("createdAt") or e.get("date") or ""
        e["date"] = e_date
        e["createdAt"] = e_created
        res.append(ExpenseResponse(id=e["_id"], **e))
    return res

@router.post("", response_model=ExpenseResponse)
async def create_expense(payload: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    actor_name = current_user.get("name") or payload.payerName or "Manager"
    actor_id = current_user.get("id") or current_user.get("_id") or payload.paidBy

    initial_audit = [{
        "action": "Created expense",
        "actorId": actor_id,
        "actorName": actor_name,
        "timestamp": now,
    }]

    dump = payload.model_dump()
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
        body=f"{actor_name} logged '{exp.get('title')}' for ₹{float(exp.get('amount', 0)):,.2f}",
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
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_name = current_user.get("name") or "Manager"
    now = datetime.utcnow().isoformat()

    paid_by = str(existing.get("paidBy", ""))
    is_creator = (user_id == paid_by)

    # Permission check: amount editing is strictly restricted to the creator
    if payload.amount is not None:
        old_amount = round(float(existing.get("amount", 0)), 2)
        new_amount = round(float(payload.amount), 2)
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
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    res = await get_db().expenses.delete_one({"_id": expense_id})
    return {"deletedCount": res.deleted_count}
