from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.user import UserLogin, UserResponse
from app.services.security import verify_password, hash_password, create_access_token, create_refresh_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signin")
async def signin(payload: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("password") and not user["password"].startswith("pbkdf2:"):
        h = hash_password(payload.password)
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"password": h}})
        user["password"] = h
    user_data = UserResponse(id=user["_id"], **user).model_dump()
    return {
        "user": user_data,
        "accessToken": create_access_token(user["_id"]),
        "refreshToken": create_refresh_token(user["_id"]),
    }
