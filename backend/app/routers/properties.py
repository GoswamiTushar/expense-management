import time
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.models.property import PropertyCreate, PropertyResponse
from app.deps import get_current_user

router = APIRouter(prefix="/api/properties", tags=["Properties"])

async def attach_managers(props):
    ids = list({m for p in props for m in p.get("managers", [])})
    users = await get_db().users.find({"_id": {"$in": ids}}).to_list(100) if ids else []
    umap = {u["_id"]: {"id": u["_id"], "name": u.get("name", "Manager"), "email": u.get("email", ""), "initials": u.get("initials", "M"), "color": u.get("color", "#FF385C")} for u in users}
    for p in props:
        p["managerDetails"] = [umap.get(m, {"id": m, "name": "Manager"}) for m in p.get("managers", [])]
    return props

@router.get("", response_model=List[PropertyResponse])
async def list_properties(current_user: dict = Depends(get_current_user)):
    """Return only properties where the authenticated user is a manager."""
    docs = await get_db().properties.find({"managers": current_user["_id"]}).to_list(100)
    await attach_managers(docs)
    return [PropertyResponse(id=p["_id"], **p) for p in docs]

@router.post("", response_model=PropertyResponse)
async def create_property(payload: PropertyCreate, current_user: dict = Depends(get_current_user)):
    # Always include the creator as a manager
    managers = list(set(payload.managers) | {current_user["_id"]})
    prop = {
        "_id": f"prop_{int(time.time()*1000)}",
        "name": payload.name.strip(), "location": payload.location.strip(),
        "managers": managers, "otaLinks": payload.otaLinks,
        "createdAt": datetime.utcnow().isoformat(),
    }
    await get_db().properties.insert_one(prop)
    await attach_managers([prop])
    return PropertyResponse(id=prop["_id"], **prop)

@router.post("/{property_id}/managers")
async def add_manager(property_id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    user_id = payload.get("userId")
    if not user_id: raise HTTPException(status_code=400, detail="userId is required")
    # Only existing managers of this property can add new ones
    prop_check = await get_db().properties.find_one({"_id": property_id})
    if not prop_check: raise HTTPException(status_code=404, detail="Property not found")
    if current_user["_id"] not in prop_check.get("managers", []):
        raise HTTPException(status_code=403, detail="Only existing managers can add new managers")
    res = await get_db().properties.update_one({"_id": property_id}, {"$addToSet": {"managers": user_id}})
    if res.matched_count == 0: raise HTTPException(status_code=404, detail="Property not found")
    prop = await get_db().properties.find_one({"_id": property_id})
    await attach_managers([prop])
    return PropertyResponse(id=prop["_id"], **prop)
