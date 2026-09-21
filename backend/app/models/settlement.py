from pydantic import BaseModel
from typing import Optional

class SettlementCreate(BaseModel):
    propertyId: str
    settledBy: str
    settledByName: Optional[str] = "Partner"
    paidTo: str
    paidToName: Optional[str] = "Partner"
    amount: float
    paymentMode: Optional[str] = "UPI App"

class SettlementResponse(SettlementCreate):
    id: str
    settledAt: str
    status: str
