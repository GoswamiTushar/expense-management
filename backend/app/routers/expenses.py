import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends
from app.database import get_db
from app.models.expense import ExpenseCreate, ExpenseResponse
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
    exp = {
        "_id": f"exp_{int(time.time()*1000)}",
        **payload.model_dump(),
        "date": now,
        "createdAt": now,
    }
    await get_db().expenses.insert_one(exp)
    return ExpenseResponse(id=exp["_id"], **exp)

@router.delete("/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    res = await get_db().expenses.delete_one({"_id": expense_id})
    return {"deletedCount": res.deleted_count}
