import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status, WebSocket, WebSocketDisconnect
from app.database import get_db
from app.config import settings
from app.models.notification import NotificationResponse
from app.deps import get_current_user
from app.services.realtime_manager import realtime_manager

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/vapid-public-key")
async def get_vapid_public_key():
    """Returns VAPID public key so web clients can register with Service Worker PushManager."""
    return {"publicKey": settings.vapid_public_key}

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    propertyId: Optional[str] = Query(None),
    since: Optional[str] = Query(None),
    limit: int = Query(60, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """
    List notifications for property.
    Supports delta syncing with ?since=ISO_TIMESTAMP to avoid redundant data transfer.
    """
    query = {}
    if propertyId:
        query["propertyId"] = propertyId
    if since:
        query["createdAt"] = {"$gt": since}

    docs = await get_db().notifications.find(query).sort("createdAt", -1).to_list(limit)
    return [NotificationResponse(id=n["_id"], **n) for n in docs]

@router.get("/unread-count")
async def get_unread_count(
    propertyId: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    """High-speed unread count lookup without fetching document arrays."""
    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    if not user_id:
        return {"unreadCount": 0}

    count = await get_db().notifications.count_documents({
        "propertyId": propertyId,
        "readBy": {"$ne": user_id},
    })
    return {"unreadCount": count}

@router.post("/read")
async def mark_notifications_read(
    propertyId: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    
    query = {}
    if propertyId:
        query["propertyId"] = propertyId
    query["readBy"] = {"$ne": user_id}

    await get_db().notifications.update_many(query, {"$addToSet": {"readBy": user_id}})
    return {"success": True}

@router.websocket("/ws/{propertyId}")
async def websocket_notifications(websocket: WebSocket, propertyId: str):
    """
    WebSocket endpoint for instant real-time foreground notification delivery.
    Delivers sub-50ms alerts to connected users in the property room.
    """
    await realtime_manager.connect(propertyId, websocket)
    try:
        while True:
            # Keep alive and receive client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        realtime_manager.disconnect(propertyId, websocket)
    except Exception as e:
        print(f"[WS Connection Notice] {e}")
        realtime_manager.disconnect(propertyId, websocket)
