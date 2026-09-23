import time
from datetime import datetime
from app.database import get_db

async def record_notification(
    property_id: str,
    title: str,
    body: str,
    actor_id: str,
    actor_name: str,
    notif_type: str,
    data: dict = None,
):
    if not property_id:
        return None
    try:
        now = datetime.utcnow().isoformat()
        notif = {
            "_id": f"notif_{int(time.time()*1000)}",
            "propertyId": str(property_id),
            "title": title,
            "body": body,
            "actorId": str(actor_id),
            "actorName": str(actor_name or "Manager"),
            "type": notif_type,
            "data": data or {},
            "createdAt": now,
            "readBy": [str(actor_id)],  # Actor has already seen what they did
        }
        await get_db().notifications.insert_one(notif)
        return notif
    except Exception as e:
        print(f"[Notification Record Error] {e}")
        return None
