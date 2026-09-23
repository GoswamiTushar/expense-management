from pydantic import BaseModel
from typing import List, Optional

class AuditLogEntry(BaseModel):
    action: str
    actorId: str
    actorName: str
    timestamp: str

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
    receiptUrls: Optional[List[str]] = []
    notes: Optional[str] = ""
    date: Optional[str] = None
    auditLog: Optional[List[AuditLogEntry]] = []

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None

class ExpenseResponse(ExpenseCreate):
    id: str
    date: Optional[str] = ""
    createdAt: Optional[str] = ""
    auditLog: Optional[List[AuditLogEntry]] = []
