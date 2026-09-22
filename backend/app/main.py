from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import ping_database
from app.routers import auth, auth_signup, properties, expenses, settlements, invites

app = FastAPI(title="Airbnb Expense API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(",") if settings.cors_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    ok = await ping_database()
    print(f"[FastAPI Startup] MongoDB Atlas connected: {ok}")

@app.get("/")
async def root():
    return {"name": "Airbnb Expense API", "status": "online", "docs": "/docs"}

@app.get("/health")
async def health_check():
    db_ok = await ping_database()
    return {"status": "healthy" if db_ok else "degraded", "database": db_ok}

app.include_router(auth.router)
app.include_router(auth_signup.router)
app.include_router(properties.router)
app.include_router(expenses.router)
app.include_router(settlements.router)
app.include_router(invites.router)
