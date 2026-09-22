from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.user import UserLogin, UserResponse
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
