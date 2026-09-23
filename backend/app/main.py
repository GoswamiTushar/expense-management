import asyncio
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import ping_database
from app.middleware import log_requests
from app.routers import auth, auth_signup, auth_token, properties, expenses, settlements, invites

app = FastAPI(title="Airbnb Expense API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(",") if settings.cors_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(log_requests)

_db_ready: Optional[bool] = None

async def _background_db_init():
    global _db_ready
    try:
        _db_ready = await ping_database()
        print(f"[FastAPI Startup] MongoDB Atlas connected: {_db_ready}")
    except Exception as e:
        _db_ready = False
        print(f"[FastAPI Startup] DB warm-up notice: {e}")

@app.on_event("startup")
async def startup_event():
    # Warm up MongoDB in background so Uvicorn can immediately bind port and pass Render's port check!
    asyncio.create_task(_background_db_init())

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"name": "Airbnb Expense API", "status": "online", "docs": "/docs"}

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check(check_db: bool = False):
    if check_db:
        db_ok = await ping_database()
        return {"status": "healthy" if db_ok else "degraded", "database": db_ok}
    return {
        "status": "healthy",
        "database": _db_ready if _db_ready is not None else "connecting"
    }

app.include_router(auth.router)
app.include_router(auth_signup.router)
app.include_router(auth_token.router)
app.include_router(properties.router)
app.include_router(expenses.router)
app.include_router(settlements.router)
app.include_router(invites.router)
