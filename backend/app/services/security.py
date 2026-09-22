import hashlib, secrets

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
