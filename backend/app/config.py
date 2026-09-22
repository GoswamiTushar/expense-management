import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = os.getenv("MONGODB_URI", "")
    db_name: str = os.getenv("DB_NAME", "airbnb_expenses")
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")
    cors_origins: str = os.getenv("CORS_ORIGINS", "*")
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    email_from: str = os.getenv("EMAIL_FROM", "Airbnb Manager <onboarding@resend.dev>")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
