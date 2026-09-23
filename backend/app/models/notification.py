from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class NotificationCreate(BaseModel):
    propertyId: str
    title: str
    body: str
    actorId: str
    actorName: str
    type: str  # expense_created, expense_updated, settlement
    data: Optional[Dict[str, Any]] = {}

class NotificationResponse(BaseModel):
    id: str
    propertyId: str
    title: str
    body: str
    actorId: str
    actorName: str
    type: str
    data: Optional[Dict[str, Any]] = {}
    createdAt: str
    readBy: Optional[List[str]] = []
