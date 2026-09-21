import time
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.property import PropertyCreate, PropertyResponse

router = APIRouter(prefix="/api/properties", tags=["Properties"])

@router.get("", response_model=List[PropertyResponse])
async def list_properties():
    docs = await get_db().properties.find().to_list(100)
    return [PropertyResponse(id=p["_id"], **p) for p in docs]

@router.post("", response_model=PropertyResponse)
async def create_property(payload: PropertyCreate):
    prop = {
        "_id": f"prop_{int(time.time()*1000)}",
        "name": payload.name.strip(),
        "location": payload.location.strip(),
        "managers": list(set(payload.managers)),
        "otaLinks": payload.otaLinks,
        "createdAt": datetime.utcnow().isoformat(),
    }
    await get_db().properties.insert_one(prop)
    return PropertyResponse(id=prop["_id"], **prop)

@router.post("/{property_id}/managers")
async def add_manager(property_id: str, payload: dict):
    user_id = payload.get("userId")
    if not user_id: raise HTTPException(status_code=400, detail="userId is required")
    res = await get_db().properties.update_one(
        {"_id": property_id}, {"$addToSet": {"managers": user_id}}
    )
    if res.matched_count == 0: raise HTTPException(status_code=404, detail="Property not found")
    prop = await get_db().properties.find_one({"_id": property_id})
    return PropertyResponse(id=prop["_id"], **prop)
