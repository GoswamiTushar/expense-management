from pydantic import BaseModel, Field
from typing import List, Optional

class AuditLogEntry(BaseModel):
    action: str
    actorId: str
    actorName: str
    timestamp: str
    notes: Optional[str] = ""

class ExpenseCreate(BaseModel):
    propertyId: str
    title: str
    amount: float = Field(..., gt=0, description="Expense amount must be strictly positive")
    category: str
    paidBy: str
    payerName: Optional[str] = "Manager"
    splitAmong: List[str] = Field(..., min_length=1, description="Must split among at least one manager")
    sharePerPerson: float = Field(..., gt=0, description="Share per person must be positive")
    receiptUrl: Optional[str] = ""
    receiptUrls: Optional[List[str]] = []
    notes: Optional[str] = ""
    date: Optional[str] = None
    auditLog: Optional[List[AuditLogEntry]] = []

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0, description="Updated amount must be strictly positive")
    category: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None

class DeleteExpenseRequest(BaseModel):
    reason: Optional[str] = ""

class RejectDeleteRequest(BaseModel):
    reason: Optional[str] = ""

class ExpenseResponse(ExpenseCreate):
    id: str
    date: Optional[str] = ""
    createdAt: Optional[str] = ""
    auditLog: Optional[List[AuditLogEntry]] = []
    # Soft delete & approval workflow (backward-compatible)
    isDeleted: Optional[bool] = False
    deleted: Optional[bool] = False
    deleteStatus: Optional[str] = None  # None | "pending_approval" | "approved" | "rejected"
    deleteRequestedBy: Optional[str] = None
    deleteRequestedByName: Optional[str] = None
    deleteRequestedAt: Optional[str] = None
    deleteReason: Optional[str] = None
    deletedAt: Optional[str] = None
    deletedBy: Optional[str] = None
    deleteApprovedBy: Optional[str] = None
    deleteApprovedByName: Optional[str] = None
    deleteRejectedBy: Optional[str] = None
    deleteRejectedByName: Optional[str] = None
    deleteRejectionReason: Optional[str] = None

