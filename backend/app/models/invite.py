from pydantic import BaseModel
from typing import Optional

class InviteCreate(BaseModel):
    propertyId: str
    propertyName: str
    invitedBy: str
    email: str

class InviteAccept(BaseModel):
    inviteCode: str
    name: str
    password: str
    upiId: Optional[str] = ""

class InviteResponse(BaseModel):
    id: str
    code: str
    propertyId: str
    propertyName: str
    invitedBy: str
    email: str
    status: str
    createdAt: str
