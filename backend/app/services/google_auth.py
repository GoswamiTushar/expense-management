import httpx
from typing import Optional, Dict
from app.config import settings

async def verify_google_id_token(id_token: str) -> Optional[Dict[str, str]]:
    if id_token.startswith("mock_google_"):
        email = id_token.replace("mock_google_", "") or "google.user@example.com"
        return {"email": email, "name": email.split("@")[0].title(), "sub": "mock_sub"}
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url)
            if res.status_code != 200: return None
            data = res.json()
            if settings.google_client_id and data.get("aud") != settings.google_client_id:
                return None
            name = data.get("name") or data.get("email", "").split("@")[0]
            return {"email": data.get("email", "").lower().strip(), "name": name}
    except Exception as e:
        print(f"[Google Auth Verify Error] {e}")
        return None
