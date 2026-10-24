from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
import time
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.user import (
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    VerifyResetOtpRequest,
    ResetPasswordRequest,
)
from app.services.security import verify_password, hash_password, create_access_token, create_refresh_token
from app.services.otp_service import generate_otp, send_password_reset_otp
from app.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signin")
async def signin(payload: UserLogin):
    import re
    db = get_db()
    identifier = (payload.email or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or username is required.")

    regex_ident = {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}
    user = await db.users.find_one({"$or": [{"email": regex_ident}, {"username": regex_ident}]})

    if not user:
        print(f"[Auth] Sign-in failed: No user found for '{identifier}'")
        raise HTTPException(
            status_code=401,
            detail=f"No account found with username/email '{identifier}'. Please check spelling."
        )

    if not verify_password(payload.password, user.get("password", "")):
        print(f"[Auth] Sign-in failed: Incorrect password for '{user.get('email')}'")
        raise HTTPException(
            status_code=401,
            detail="Incorrect password. Please try again or ask admin to reset."
        )

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

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the profile data of the currently authenticated user."""
    return UserResponse(id=current_user["_id"], **current_user)



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


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, bg: BackgroundTasks):
    """
    Initiate a forgot-password flow by generating a 6-digit OTP and
    emailing it to the registered user.
    """
    db = get_db()
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"No account found with email '{email}'. Please check your spelling or sign up."
        )

    otp = generate_otp()
    doc = {
        "email": email,
        "otp": otp,
        "expiresAt": time.time() + 600,
        "verified": False,
        "updatedAt": time.time(),
    }
    await db.password_resets.update_one({"email": email}, {"$set": doc}, upsert=True)
    bg.add_task(send_password_reset_otp, email, otp)
    return {
        "status": "otp_sent",
        "email": email,
        "message": "A 6-digit confirmation code has been sent to your email."
    }


@router.post("/verify-reset-otp")
async def verify_reset_otp(payload: VerifyResetOtpRequest):
    """
    Verify the 6-digit OTP provided by the user before letting them reset their password.
    """
    db = get_db()
    email = payload.email.lower().strip()
    record = await db.password_resets.find_one({"email": email})
    if not record or record.get("expiresAt", 0) < time.time():
        raise HTTPException(status_code=400, detail="Confirmation code expired. Please request a new code.")

    if record.get("otp") != payload.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid 6-digit confirmation code. Please try again.")

    await db.password_resets.update_one(
        {"_id": record["_id"]},
        {"$set": {"verified": True, "verifiedAt": time.time()}}
    )
    return {
        "status": "otp_verified",
        "email": email,
        "message": "Confirmation successful. You may now enter your new password."
    }


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    """
    Confirm OTP and securely update user password to new password.
    Returns session tokens to automatically sign in the user.
    """
    db = get_db()
    email = payload.email.lower().strip()
    new_pw = payload.newPassword.strip()
    if len(new_pw) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    record = await db.password_resets.find_one({"email": email})
    if not record or record.get("expiresAt", 0) < time.time():
        raise HTTPException(status_code=400, detail="Password reset session expired. Please start over.")

    if not record.get("verified") and record.get("otp") != payload.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid confirmation code.")

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    new_hash = hash_password(new_pw)
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"password": new_hash}})
    await db.password_resets.delete_one({"_id": record["_id"]})

    user["password"] = new_hash
    user_data = UserResponse(id=user["_id"], **user).model_dump()
    return {
        "status": "password_reset_success",
        "message": "Password reset successfully.",
        "user": user_data,
        "accessToken": create_access_token(user["_id"]),
        "refreshToken": create_refresh_token(user["_id"]),
    }

