import time, random
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.user import UserCreate, UserLogin, GoogleAuthRequest, UserResponse
from app.services.google_auth import verify_google_id_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])
COLORS = ["#FF385C", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"]

def create_user_doc(name: str, email: str, password: str = "", upi_id: str = ""):
    initials = "".join([n[0] for n in name.strip().split(" ")])[:2].upper()
    return {
        "_id": f"user_{int(time.time()*1000)}_{random.randint(100, 999)}",
        "name": name.strip(), "email": email.strip().lower(), "password": password,
        "upiId": upi_id.strip(), "initials": initials, "color": random.choice(COLORS),
    }

@router.post("/signup", response_model=UserResponse)
async def signup(payload: UserCreate):
    db = get_db()
    if await db.users.find_one({"email": payload.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user_doc(payload.name, payload.email, payload.password, payload.upiId or "")
    await db.users.insert_one(user)
    return UserResponse(id=user["_id"], **user)

@router.post("/signin", response_model=UserResponse)
async def signin(payload: UserLogin):
    user = await get_db().users.find_one({"email": payload.email.lower()})
    if not user or user.get("password") != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return UserResponse(id=user["_id"], **user)

@router.post("/google", response_model=UserResponse)
async def google_auth(payload: GoogleAuthRequest):
    guser = await verify_google_id_token(payload.id_token)
    if not guser: raise HTTPException(status_code=400, detail="Invalid Google token")
    db = get_db()
    user = await db.users.find_one({"email": guser["email"]})
    if not user:
        user = create_user_doc(guser["name"], guser["email"], upi_id=payload.upiId or "")
        await db.users.insert_one(user)
    return UserResponse(id=user["_id"], **user)
