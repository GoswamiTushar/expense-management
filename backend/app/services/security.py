import hashlib, secrets
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.config import settings

# ── Password hashing ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    if not password:
        return ""
    if password.startswith("pbkdf2:"):
        return password
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
    return f"pbkdf2:sha256:100000${salt}${key.hex()}"

def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    if not hashed.startswith("pbkdf2:"):
        return plain == hashed
    try:
        _, salt, expected = hashed.split("$")
        key = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 100000)
        return secrets.compare_digest(key.hex(), expected)
    except Exception:
        return False

# ── JWT tokens ──────────────────────────────────────────────────────────────

ALGORITHM = "HS256"

def create_access_token(user_id: str) -> str:
    """Short-lived token (default 15 min) used for every API request."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode(
        {"sub": user_id, "type": "access", "exp": expire},
        settings.jwt_secret, algorithm=ALGORITHM,
    )

def create_refresh_token(user_id: str) -> str:
    """Long-lived token (default 30 days) used only to obtain new access tokens."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_expire_days)
    return jwt.encode(
        {"sub": user_id, "type": "refresh", "exp": expire},
        settings.jwt_secret, algorithm=ALGORITHM,
    )

def decode_token(token: str, expected_type: str = "access") -> str | None:
    """Decode and validate a JWT. Returns user_id string or None if invalid."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            return None
        return payload.get("sub")
    except JWTError:
        return None
