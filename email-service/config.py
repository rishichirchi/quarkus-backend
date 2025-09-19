import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    BREVO_SENDER_EMAIL: str = os.getenv("BREVO_SENDER_EMAIL", "noreply@authservice.com")
    BREVO_SENDER_NAME: str = os.getenv("BREVO_SENDER_NAME", "AuthService")
    VERIFICATION_URL: str = os.getenv("VERIFICATION_URL", "http://localhost:8080")

    class Config:
        env_file = ".env"

settings = Settings()