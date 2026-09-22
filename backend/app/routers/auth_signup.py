import time
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.user import UserCreate, VerifyOtpRequest, ResendOtpRequest, UserResponse
from app.services.otp_service import generate_otp, send_verification_otp
from app.services.user_helper import create_user_doc

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup")
async def signup(payload: UserCreate):
    db = get_db()
    if await db.users.find_one({"email": payload.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")
    otp = generate_otp()
    doc = {"name": payload.name.strip(), "email": payload.email.lower(), "password": payload.password, "upiId": payload.upiId or "", "otp": otp, "expiresAt": time.time() + 600}
    await db.pending_verifications.update_one({"email": payload.email.lower()}, {"$set": doc}, upsert=True)
    send_verification_otp(payload.email, otp)
    return {"status": "pending_verification", "email": payload.email.lower()}

@router.post("/verify-otp", response_model=UserResponse)
async def verify_otp(payload: VerifyOtpRequest):
    db = get_db()
    p = await db.pending_verifications.find_one({"email": payload.email.lower()})
    if not p or p.get("expiresAt", 0) < time.time():
        raise HTTPException(status_code=400, detail="Code expired or not found")
    if p.get("otp") != payload.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code")
    user = create_user_doc(p["name"], p["email"], p["password"], p["upiId"])
    await db.users.insert_one(user)
    await db.pending_verifications.delete_one({"_id": p["_id"]})
    return UserResponse(id=user["_id"], **user)

@router.post("/resend-otp")
async def resend_otp(payload: ResendOtpRequest):
    db = get_db()
    p = await db.pending_verifications.find_one({"email": payload.email.lower()})
    if not p: raise HTTPException(status_code=400, detail="No pending signup found")
    otp = generate_otp()
    await db.pending_verifications.update_one({"_id": p["_id"]}, {"$set": {"otp": otp, "expiresAt": time.time() + 600}})
    send_verification_otp(payload.email, otp)
    return {"status": "otp_resent", "email": payload.email.lower()}
