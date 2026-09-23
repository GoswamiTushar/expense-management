import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.deps import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("", response_model=List[ExpenseResponse])
async def list_expenses(propertyId: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"propertyId": propertyId} if propertyId else {}
    docs = await get_db().expenses.find(query).sort("createdAt", -1).to_list(200)
    return [ExpenseResponse(id=e["_id"], **e) for e in docs]

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

    exp = {
        "_id": f"exp_{int(time.time()*1000)}",
        **dump,
        "date": now,
        "createdAt": now,
    }
    await get_db().expenses.insert_one(exp)
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

    audit_log = list(existing.get("auditLog") or [])
    # If legacy expense has no creation entry, synthesize one
    if not audit_log:
        audit_log.append({
            "action": "Created expense",
            "actorId": str(existing.get("paidBy", "")),
            "actorName": existing.get("payerName") or "Manager",
            "timestamp": existing.get("createdAt") or existing.get("date") or now,
        })

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

    existing["auditLog"] = audit_log

    await get_db().expenses.update_one({"_id": expense_id}, {"$set": existing})
    return ExpenseResponse(id=existing["_id"], **existing)

@router.delete("/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    res = await get_db().expenses.delete_one({"_id": expense_id})
    return {"deletedCount": res.deleted_count}
