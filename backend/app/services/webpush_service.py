import json
import asyncio
from typing import List, Optional
from pywebpush import webpush, WebPushException
from app.config import settings
from app.database import get_db

async def dispatch_web_push(
    user_ids: List[str],
    title: str,
    body: str,
    data: Optional[dict] = None,
):
    """
    Sends W3C standard Web Push notifications to registered browser Service Workers
    via Google FCM, Apple Web Push, or Mozilla push endpoints.
    Allows lockscreen notifications even when browser / PWA is 100% closed.
    """
    if not user_ids:
        return
    if not settings.vapid_private_key:
        print("[WebPush] Skipping: VAPID keys not configured in .env")
        return

    try:
        db = get_db()
        users = await db.users.find(
            {"_id": {"$in": [str(uid) for uid in user_ids]}},
            {"webPushSubscriptions": 1}
        ).to_list(100)

        all_subs = []
        for u in users:
            subs = u.get("webPushSubscriptions") or []
            for s in subs:
                if isinstance(s, dict) and s.get("endpoint"):
                    all_subs.append((str(u["_id"]), s))

        if not all_subs:
            return

        payload_str = json.dumps({
            "title": title,
            "body": body,
            "icon": "/icon-192.png",
            "badge": "/favicon.png",
            "data": data or {},
            "tag": "ledger-alert",
        })

        claims_email = settings.vapid_claims_email or "contact@tushargoswami.dev"
        if not claims_email.startswith("mailto:"):
            claims_email = f"mailto:{claims_email}"
        vapid_claims = {"sub": claims_email}

        # Run webpush in thread pool to avoid blocking async event loop
        loop = asyncio.get_event_loop()

        def _send(user_id: str, sub: dict):
            try:
                webpush(
                    subscription_info=sub,
                    data=payload_str,
                    vapid_private_key=settings.vapid_private_key,
                    vapid_claims=vapid_claims,
                    timeout=5,
                )
                return None
            except WebPushException as ex:
                status_code = getattr(ex.response, "status_code", None) if hasattr(ex, "response") else None
                # 404 or 410 means subscription is expired or revoked by user
                if status_code in (404, 410):
                    return (user_id, sub.get("endpoint"))
                print(f"[WebPush Warning] Push failed ({status_code}): {ex}")
                return None
            except Exception as e:
                print(f"[WebPush Error] {e}")
                return None

        # Execute push dispatches concurrently
        tasks = [loop.run_in_executor(None, _send, uid, sub) for uid, sub in all_subs]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Clean up any dead / unsubscribed endpoints
        stale_cleanups = [r for r in results if isinstance(r, tuple) and r[1]]
        for uid, endpoint in stale_cleanups:
            try:
                await db.users.update_one(
                    {"_id": uid},
                    {"$pull": {"webPushSubscriptions": {"endpoint": endpoint}}}
                )
                print(f"[WebPush Cleanup] Pruned expired subscription for user {uid}")
            except Exception as clean_err:
                print(f"[WebPush Cleanup Error] {clean_err}")

    except Exception as e:
        print(f"[WebPush Dispatch Error] {e}")
