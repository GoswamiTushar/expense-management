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

@app.on_event("startup")
async def startup_event():
    ok = await ping_database()
    print(f"[FastAPI Startup] MongoDB Atlas connected: {ok}")

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"name": "Airbnb Expense API", "status": "online", "docs": "/docs"}

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    db_ok = await ping_database()
    return {"status": "healthy" if db_ok else "degraded", "database": db_ok}

app.include_router(auth.router)
app.include_router(auth_signup.router)
app.include_router(auth_token.router)
app.include_router(properties.router)
app.include_router(expenses.router)
app.include_router(settlements.router)
app.include_router(invites.router)
