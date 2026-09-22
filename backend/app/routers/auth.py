from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.user import UserLogin, GoogleAuthRequest, UserResponse
from app.services.google_auth import verify_google_id_token
from app.services.user_helper import create_user_doc
from app.services.security import verify_password, hash_password

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signin", response_model=UserResponse)
async def signin(payload: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("password") and not user["password"].startswith("pbkdf2:"):
        h = hash_password(payload.password)
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"password": h}})
        user["password"] = h
    return UserResponse(id=user["_id"], **user)

@router.post("/google", response_model=UserResponse)
async def google_auth(payload: GoogleAuthRequest):
    guser = await verify_google_id_token(payload.id_token)
    if not guser: raise HTTPException(status_code=400, detail="Invalid Google token")
    db = get_db()
    user = await db.users.find_one({"email": guser["email"]})
    if not user:
        user = create_user_doc(guser["name"], guser["email"], upi_id=payload.upiId or "")
        await db.users.insert_one(user)
    return UserResponse(id=user["_id"], **user)
