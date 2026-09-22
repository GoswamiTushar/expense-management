from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db
from app.services.security import decode_token

_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
):
    """
    FastAPI dependency that validates a Bearer access token and returns the
    authenticated user document. Raises 401 if token is missing or invalid.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = decode_token(credentials.credentials, expected_type="access")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await get_db().users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
