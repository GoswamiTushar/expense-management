from pydantic import BaseModel, Field
from typing import Optional, List

class SettlementAuditEntry(BaseModel):
    action: str  # "created", "confirmed", "rejected"
    actorId: str
    actorName: str
    timestamp: str
    notes: Optional[str] = ""

class SettlementCreate(BaseModel):
    propertyId: str
    settledBy: str
    settledByName: Optional[str] = "Partner"
    paidTo: str
    paidToName: Optional[str] = "Partner"
    amount: float = Field(..., gt=0, description="Settlement amount must be positive")
    paymentMode: Optional[str] = "Cash"  # "Cash", "UPI", "UPI App", "Bank Transfer", "Other"
    notes: Optional[str] = ""
    verificationCode: Optional[str] = None  # e.g., "SPLIT-4F2A"

class SettlementRejectRequest(BaseModel):
    reason: Optional[str] = "Payment not received"

class SettlementUpdateRequest(BaseModel):
    amount: Optional[float] = Field(None, gt=0, description="Settlement amount must be positive")
    paymentMode: Optional[str] = None
    notes: Optional[str] = None
    verificationCode: Optional[str] = None

class SettlementResponse(BaseModel):
    id: str
    propertyId: str
    settledBy: str
    settledByName: Optional[str] = "Partner"
    paidTo: str
    paidToName: Optional[str] = "Partner"
    amount: float
    paymentMode: Optional[str] = "Cash"
    notes: Optional[str] = ""
    status: str = "pending"  # "pending", "confirmed", "rejected"
    initiatedBy: Optional[str] = ""
    createdAt: Optional[str] = ""
    settledAt: Optional[str] = None
    confirmedBy: Optional[str] = None
    rejectionReason: Optional[str] = None
    verificationCode: Optional[str] = None
    auditLog: Optional[List[SettlementAuditEntry]] = []

class OweItemInfo(BaseModel):
    userId: str
    name: Optional[str] = "Partner"
    amount: float

class PairwiseDebtInfo(BaseModel):
    fromUserId: str
    fromName: Optional[str] = "Partner"
    toUserId: str
    toName: Optional[str] = "Partner"
    amount: float

class PropertyBalanceResponse(BaseModel):
    propertyId: str
    currentUserNet: float
    peopleUserOwes: List[OweItemInfo] = []
    peopleWhoOweUser: List[OweItemInfo] = []
    pendingIncoming: List[SettlementResponse] = []
    pendingOutgoing: List[SettlementResponse] = []
    totalExpenses: float = 0.0
    pairwiseDebts: List[PairwiseDebtInfo] = []
