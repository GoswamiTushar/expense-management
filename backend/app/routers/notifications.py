from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.database import get_db
from app.models.notification import NotificationResponse
from app.deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    propertyId: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    query = {}
    if propertyId:
        query["propertyId"] = propertyId
    docs = await get_db().notifications.find(query).sort("createdAt", -1).to_list(60)
    return [NotificationResponse(id=n["_id"], **n) for n in docs]

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
