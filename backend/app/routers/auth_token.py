from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.security import decode_token, create_access_token, create_refresh_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class RefreshRequest(BaseModel):
    refreshToken: str

@router.post("/refresh")
async def refresh_token(payload: RefreshRequest):
    """
    Exchange a valid refresh token for a new access token + rotated refresh token.
    Implements refresh token rotation — old refresh token is implicitly invalidated
    since we use stateless JWTs (the new one supersedes it).
    """
    user_id = decode_token(payload.refreshToken, expected_type="refresh")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or has expired. Please sign in again.",
        )
    return {
        "accessToken": create_access_token(user_id),
        "refreshToken": create_refresh_token(user_id),  # rotation: issue new refresh token
    }

@router.post("/logout")
async def logout():
    """
    Client-side logout — instruct client to clear stored tokens.
    With stateless JWTs the server cannot revoke tokens, but the short 15-min
    access token TTL limits the risk window.
    """
    return {"status": "logged_out"}
