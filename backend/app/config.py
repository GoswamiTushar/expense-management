import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = os.getenv("MONGODB_URI", "")
    db_name: str = os.getenv("DB_NAME", "airbnb_expenses")
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")
    cors_origins: str = os.getenv("CORS_ORIGINS", "*")
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    email_from: str = os.getenv("EMAIL_FROM", "")
    # JWT / Auth
    jwt_secret: str = os.getenv("JWT_SECRET", "")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "15"))
    jwt_refresh_expire_days: int = int(os.getenv("JWT_REFRESH_EXPIRE_DAYS", "30"))
    # Admin Seed from .env
    admin_username: str = os.getenv("ADMIN_USERNAME", "")
    admin_email: str = os.getenv("ADMIN_EMAIL", "")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
