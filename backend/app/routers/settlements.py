import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends
from app.database import get_db
from app.models.settlement import SettlementCreate, SettlementResponse
from app.deps import get_current_user
from app.services.notification_service import record_notification

router = APIRouter(prefix="/api/settlements", tags=["Settlements"])

@router.get("", response_model=List[SettlementResponse])
async def list_settlements(propertyId: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"propertyId": propertyId} if propertyId else {}
    docs = await get_db().settlements.find(query).sort("settledAt", -1).to_list(200)
    return [SettlementResponse(id=s["_id"], **s) for s in docs]

@router.post("", response_model=SettlementResponse)
async def create_settlement(payload: SettlementCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    record = {
        "_id": f"settle_{int(time.time()*1000)}",
        **payload.model_dump(),
        "settledAt": now,
        "status": "completed",
    }
    await get_db().settlements.insert_one(record)

    actor_name = current_user.get("name") or "Manager"
    actor_id = current_user.get("id") or current_user.get("_id") or ""
    await record_notification(
        property_id=record.get("propertyId"),
        title="Settlement Recorded",
        body=f"{actor_name} recorded a settlement of ₹{float(record.get('amount', 0)):,.2f}",
        actor_id=actor_id,
        actor_name=actor_name,
        notif_type="settlement",
        data={"settlementId": record["_id"], "amount": record.get("amount")},
    )

    return SettlementResponse(id=record["_id"], **record)
