import time
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional
import httpx
from app.database import get_db
from app.services.realtime_manager import realtime_manager
from app.services.webpush_service import dispatch_web_push

EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send"

async def dispatch_expo_push(
    user_ids: List[str],
    title: str,
    body: str,
    data: Optional[dict] = None,
):
    """
    Sends mobile OS-level notifications to registered Expo push tokens
    for the specified user IDs. Auto-prunes unregistered tokens.
    """
    if not user_ids:
        return

    try:
        db = get_db()
        users = await db.users.find(
            {"_id": {"$in": [str(uid) for uid in user_ids]}},
            {"pushTokens": 1, "expoPushToken": 1}
        ).to_list(100)

        token_to_user = {}
        for u in users:
            uid = str(u["_id"])
            pts = u.get("pushTokens") or []
            if isinstance(pts, list):
                for t in pts:
                    if t and isinstance(t, str) and t.startswith("ExponentPushToken"):
                        token_to_user[t] = uid
            single = u.get("expoPushToken")
            if single and isinstance(single, str) and single.startswith("ExponentPushToken"):
                token_to_user[single] = uid

        tokens = list(token_to_user.keys())
        if not tokens:
            return

        # Batch in chunks of 100 per Expo API specification
        chunk_size = 100
        for i in range(0, len(tokens), chunk_size):
            chunk = tokens[i : i + chunk_size]
            messages = [
                {
                    "to": token,
                    "title": title,
                    "body": body,
                    "sound": "default",
                    "priority": "high",
                    "channelId": "default",
                    "_displayInForeground": True,
                    "data": data or {},
                }
                for token in chunk
            ]

            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(
                        EXPO_PUSH_ENDPOINT,
                        json=messages,
                        headers={"Content-Type": "application/json"},
                    )
                    if resp.status_code == 200:
                        res_json = resp.json()
                        tickets = res_json.get("data") or []
                        # Check for DeviceNotRegistered and auto-prune
                        for idx, ticket in enumerate(tickets):
                            if ticket.get("status") == "error" and ticket.get("details", {}).get("error") == "DeviceNotRegistered":
                                dead_token = chunk[idx]
                                dead_user_id = token_to_user.get(dead_token)
                                if dead_user_id:
                                    await db.users.update_one(
                                        {"_id": dead_user_id},
                                        {"$pull": {"pushTokens": dead_token}}
                                    )
                                    print(f"[Expo Push Cleanup] Pruned unregistered token for user {dead_user_id}")
                    else:
                        print(f"[Expo Push Warning] Status {resp.status_code}: {resp.text}")
            except Exception as batch_err:
                print(f"[Expo Push Batch Error] {batch_err}")

    except Exception as e:
        print(f"[Expo Push Error] {e}")


async def record_notification(
    property_id: str,
    title: str,
    body: str,
    actor_id: str,
    actor_name: str,
    notif_type: str,
    data: dict = None,
    target_user_ids: Optional[List[str]] = None,
):
    """
    Unified non-blocking notification recorder:
    1. Saves notification record to MongoDB with 90-day TTL.
    2. Broadcasts instant event via WebSockets to foreground app users.
    3. Dispatches OS lockscreen push to both Web Push (VAPID) and Native Mobile (Expo).
    """
    if not property_id:
        return None

    try:
        db = get_db()
        now_dt = datetime.utcnow()
        now_iso = now_dt.isoformat() + "Z"
        expire_at = now_dt + timedelta(days=90)

        notif_id = f"notif_{int(time.time()*1000)}"
        notif = {
            "_id": notif_id,
            "propertyId": str(property_id),
            "title": title,
            "body": body,
            "actorId": str(actor_id),
            "actorName": str(actor_name or "Manager"),
            "type": notif_type,
            "data": data or {},
            "createdAt": now_iso,
            "expireAt": expire_at,
            "readBy": [str(actor_id)],  # Actor has already seen what they did
        }

        # 1. Store in MongoDB
        await db.notifications.insert_one(notif)

        # 2. Determine target user IDs if not provided (all property members except actor)
        recipients = target_user_ids
        if recipients is None:
            prop = await db.properties.find_one({"_id": str(property_id)}, {"members": 1})
            if prop and "members" in prop:
                recipients = [
                    str(m["userId"]) for m in prop.get("members", [])
                    if str(m.get("userId")) != str(actor_id)
                ]
            else:
                recipients = []

        # 3. Broadcast to active in-app WebSocket connections (sub-50ms instant delivery)
        ws_event = {
            "event": "new_notification",
            "data": {
                "id": notif_id,
                "propertyId": str(property_id),
                "title": title,
                "body": body,
                "actorId": str(actor_id),
                "actorName": str(actor_name or "Manager"),
                "type": notif_type,
                "data": data or {},
                "createdAt": now_iso,
                "readBy": [str(actor_id)],
            }
        }
        await realtime_manager.broadcast_to_property(str(property_id), ws_event)

        # 4. Asynchronously dispatch OS lockscreen notifications to Native & Web
        if recipients:
            await asyncio.gather(
                dispatch_expo_push(recipients, title, body, data),
                dispatch_web_push(recipients, title, body, data),
                return_exceptions=True,
            )

        return notif
    except Exception as e:
        print(f"[Notification Record Error] {e}")
        return None
