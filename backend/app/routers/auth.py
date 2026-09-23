from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.user import UserLogin, UserResponse
from app.services.security import verify_password, hash_password, create_access_token, create_refresh_token
from app.deps import get_current_user

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


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    upiId: Optional[str] = None


@router.patch("/profile")
async def update_profile(payload: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """Update the authenticated user's name and/or UPI ID in the database."""
    db = get_db()
    updates = {}
    if payload.name is not None:
        name = payload.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be empty.")
        updates["name"] = name
        updates["initials"] = "".join(p[0] for p in name.split() if p)[:2].upper()
    if payload.upiId is not None:
        updates["upiId"] = payload.upiId.strip()

    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    await db.users.update_one({"_id": current_user["_id"]}, {"$set": updates})

    # Return updated user
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(id=updated["_id"], **updated).model_dump()


class PushTokenRequest(BaseModel):
    token: str
    platform: Optional[str] = None  # "android", "ios", "web"


@router.patch("/push-token")
async def register_push_token(payload: PushTokenRequest, current_user: dict = Depends(get_current_user)):
    """Store/update the device push token for the current user."""
    db = get_db()
    token = payload.token.strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token cannot be empty.")

    # Store as a set of tokens (user may have multiple devices)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$addToSet": {"pushTokens": token}}
    )
    return {"success": True}
