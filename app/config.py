from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Stripe Configuration
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "https://your-domain.com"]
    
    class Config:
        env_file = ".env"

settings = Settings()