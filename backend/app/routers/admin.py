from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.database import get_db
from app.deps import get_current_user
from app.services.security import hash_password

router = APIRouter(prefix="/api/admin", tags=["Admin"])

async def ensure_admin_user():
    """Ensure default admin user exists with username 'admin' and password 'admin123'."""
    db = get_db()
    admin_user = await db.users.find_one({"$or": [{"username": "admin"}, {"email": "admin"}, {"email": "admin@airbnb.com"}]})
    if not admin_user:
        new_admin = {
            "_id": "admin_root",
            "username": "admin",
            "email": "admin@airbnb.com",
            "name": "System Admin",
            "role": "admin",
            "password": hash_password("admin123"),
            "initials": "AD",
            "color": "#FF385C",
            "upiId": "",
            "createdAt": datetime.utcnow().isoformat(),
        }
        await db.users.insert_one(new_admin)
        print("[Admin Init] Created default admin user (username: admin)")
    else:
        # Ensure role is admin and password is valid admin123
        await db.users.update_one(
            {"_id": admin_user["_id"]},
            {"$set": {"role": "admin", "password": hash_password("admin123"), "username": "admin"}}
        )
        print("[Admin Init] Verified admin user credentials.")

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to access this resource.",
        )
    return current_user

class ResetPasswordRequest(BaseModel):
    newPassword: str = Field(..., min_length=4, description="New password for the user")

@router.get("/users")
async def list_admin_users(admin: dict = Depends(require_admin)):
    """List all registered users in the system."""
    db = get_db()
    users_cursor = db.users.find({}).sort("name", 1)
    users = await users_cursor.to_list(1000)

    # Get properties to count memberships
    properties = await db.properties.find({}).to_list(500)

    result = []
    for u in users:
        u_id = str(u["_id"])
        # Find properties user belongs to
        user_props = [
            {"id": str(p["_id"]), "name": p.get("name", "Property")}
            for p in properties
            if u_id in [str(m) for m in (p.get("managers") or [])]
        ]

        result.append({
            "id": u_id,
            "name": u.get("name", "User"),
            "email": u.get("email", ""),
            "username": u.get("username", ""),
            "role": u.get("role", "user"),
            "upiId": u.get("upiId", ""),
            "initials": u.get("initials", "U"),
            "color": u.get("color", "#64748B"),
            "createdAt": u.get("createdAt", ""),
            "properties": user_props,
            "propertiesCount": len(user_props),
        })

    return result

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: str,
    payload: ResetPasswordRequest,
    admin: dict = Depends(require_admin),
):
    """Admin resets a user's password."""
    db = get_db()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_hash = hash_password(payload.newPassword)
    await db.users.update_one({"_id": user_id}, {"$set": {"password": new_hash}})

    return {
        "success": True,
        "message": f"Password for {user.get('name', 'User')} ({user.get('email', '')}) has been reset successfully.",
        "userId": user_id,
        "newPassword": payload.newPassword,
    }

class AdminUpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None

@router.patch("/users/{user_id}")
async def admin_update_user(
    user_id: str,
    payload: AdminUpdateUserRequest,
    admin: dict = Depends(require_admin),
):
    """Admin updates user profile details such as email or name."""
    db = get_db()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = {}
    if payload.name is not None and payload.name.strip():
        updates["name"] = payload.name.strip()
    if payload.email is not None and payload.email.strip():
        clean_email = payload.email.strip().lower()
        dup = await db.users.find_one({"email": clean_email, "_id": {"$ne": user_id}})
        if dup:
            raise HTTPException(status_code=400, detail="Email is already used by another user.")
        updates["email"] = clean_email
    if payload.username is not None and payload.username.strip():
        clean_uname = payload.username.strip().lower()
        dup = await db.users.find_one({"username": clean_uname, "_id": {"$ne": user_id}})
        if dup:
            raise HTTPException(status_code=400, detail="Username is already used by another user.")
        updates["username"] = clean_uname

    if updates:
        await db.users.update_one({"_id": user_id}, {"$set": updates})

    return {"success": True, "message": "User details updated successfully."}

@router.get("/properties")
async def list_admin_properties(admin: dict = Depends(require_admin)):
    """List all properties with manager metadata for filters."""
    db = get_db()
    props = await db.properties.find({}).sort("name", 1).to_list(500)
    users = await db.users.find({}).to_list(1000)
    user_map = {str(u["_id"]): u for u in users}

    result = []
    for p in props:
        p_id = str(p["_id"])
        manager_ids = [str(m) for m in (p.get("managers") or [])]
        manager_list = [
            {
                "id": m_id,
                "name": user_map.get(m_id, {}).get("name") or "Partner",
                "email": user_map.get(m_id, {}).get("email") or "",
            }
            for m_id in manager_ids
        ]
        result.append({
            "id": p_id,
            "name": p.get("name", "Property"),
            "location": p.get("location", ""),
            "managers": manager_list,
        })
    return result

@router.get("/expenses")
async def query_admin_expenses(
    propertyId: Optional[str] = None,
    userId: Optional[str] = None,
    admin: dict = Depends(require_admin),
):
    """
    Explore expenses across all properties with cascading filters:
    Filter 1: Property
    Filter 2: Onboarded User
    """
    db = get_db()
    query: Dict[str, Any] = {}

    if propertyId and propertyId.lower() != "all":
        query["propertyId"] = propertyId

    if userId and userId.lower() != "all":
        # Match where user paid OR was included in the split
        query["$or"] = [
            {"paidBy": userId},
            {"splitAmong": userId},
        ]

    expenses = await db.expenses.find(query).sort("createdAt", -1).to_list(2000)

    # Fetch property map and user map to enrich expense details
    props = await db.properties.find({}).to_list(500)
    prop_map = {str(p["_id"]): p.get("name", "Property") for p in props}

    users = await db.users.find({}).to_list(1000)
    user_map = {str(u["_id"]): u.get("name", "Partner") for u in users}

    total_amount = sum(float(e.get("amount") or 0) for e in expenses)

    items = []
    for e in expenses:
        p_id = str(e.get("propertyId", ""))
        payer_id = str(e.get("paidBy", ""))
        split_ids = [str(s) for s in (e.get("splitAmong") or [])]
        split_names = [user_map.get(s_id, s_id) for s_id in split_ids]

        items.append({
            "id": str(e["_id"]),
            "propertyId": p_id,
            "propertyName": prop_map.get(p_id, "Unknown Property"),
            "title": e.get("title", ""),
            "amount": float(e.get("amount", 0)),
            "category": e.get("category", "Other"),
            "paidBy": payer_id,
            "payerName": user_map.get(payer_id) or e.get("payerName") or "Partner",
            "splitAmong": split_ids,
            "splitNames": split_names,
            "sharePerPerson": float(e.get("sharePerPerson", 0)),
            "date": e.get("date") or e.get("createdAt") or "",
            "createdAt": e.get("createdAt") or "",
            "receiptUrl": e.get("receiptUrl") or "",
            "notes": e.get("notes") or "",
        })

    return {
        "totalAmount": round(total_amount, 2),
        "count": len(items),
        "expenses": items,
    }
