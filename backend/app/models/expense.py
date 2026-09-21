from pydantic import BaseModel
from typing import List, Optional

class ExpenseCreate(BaseModel):
    propertyId: str
    title: str
    amount: float
    category: str
    paidBy: str
    payerName: Optional[str] = "Manager"
    splitAmong: List[str]
    sharePerPerson: float
    receiptUrl: Optional[str] = ""
    notes: Optional[str] = ""

class ExpenseResponse(ExpenseCreate):
    id: str
    date: str
    createdAt: str
