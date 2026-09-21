import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = os.getenv("MONGODB_URI", "")
    db_name: str = os.getenv("DB_NAME", "airbnb_expenses")
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")
    cors_origins: str = os.getenv("CORS_ORIGINS", "*")
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_pass: str = os.getenv("SMTP_PASS", "")
    smtp_from: str = os.getenv("SMTP_FROM", "noreply@airbnbexpenses.com")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
