import json, urllib.request, urllib.error
from app.config import settings

def send_mail(to_email: str, subject: str, html: str, cc: list = None) -> bool:
    if not settings.resend_api_key:
        print(f"[Mailer MOCK] Resend API key missing. Email to {to_email} skipped.")
        return True
    try:
        url = "https://api.resend.com/emails"
        sender = settings.email_from or "Airbnb Manager <contact@tushargoswami.dev>"
        payload = {"from": sender, "to": [to_email], "subject": subject, "html": html}
        if cc:
            payload["cc"] = [c for c in cc if c]
        headers = {
            "Authorization": f"Bearer {settings.resend_api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status in (200, 201)
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", errors="ignore")
        print(f"[Mailer Warning] Resend error ({e.code}): {msg}")
        return False
    except Exception as e:
        print(f"[Mailer Warning] Delivery error: {e}")
        return False
