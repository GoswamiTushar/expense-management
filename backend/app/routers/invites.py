import time, random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.invite import InviteCreate, InviteAccept, InviteResponse
from app.routers.auth import create_user_doc
from app.services.email_service import send_onboarding_email

router = APIRouter(prefix="/api/invites", tags=["Invites"])

@router.post("", response_model=InviteResponse)
async def create_invite(payload: InviteCreate):
    code = f"INV-{''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=5))}"
    inv = {
        "_id": f"inv_{int(time.time()*1000)}",
        "code": code, **payload.model_dump(),
        "status": "pending", "createdAt": datetime.utcnow().isoformat(),
    }
    await get_db().invites.insert_one(inv)
    send_onboarding_email(payload.email, code, payload.propertyName, payload.invitedBy)
    return InviteResponse(id=inv["_id"], **inv)

@router.get("/{code}", response_model=InviteResponse)
async def get_invite(code: str):
    inv = await get_db().invites.find_one({"code": code.strip().upper()})
    if not inv: raise HTTPException(status_code=404, detail="Invite code not found")
    return InviteResponse(id=inv["_id"], **inv)

@router.post("/accept")
async def accept_invite(payload: InviteAccept):
    db = get_db()
    inv = await db.invites.find_one({"code": payload.inviteCode.strip().upper(), "status": "pending"})
    if not inv: raise HTTPException(status_code=400, detail="Invalid or expired invite code")
    if payload.userId:
        user = await db.users.find_one({"_id": payload.userId})
        if not user: raise HTTPException(status_code=404, detail="User not found")
    else:
        user = await db.users.find_one({"email": inv["email"].lower()})
        if not user:
            user = create_user_doc(payload.name or "Manager", inv["email"], payload.password or "", payload.upiId or "")
            await db.users.insert_one(user)
    await db.properties.update_one({"_id": inv["propertyId"]}, {"$addToSet": {"managers": user["_id"]}})
    await db.invites.update_one({"_id": inv["_id"]}, {"$set": {"status": "accepted", "acceptedBy": user["_id"]}})
    return {"user": {**user, "id": user["_id"]}, "propertyId": inv["propertyId"]}
