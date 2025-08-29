from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import field_validator, Field
import os
from functools import lru_cache


class Settings(BaseSettings):
    # Application Configuration
    APP_NAME: str = "HiddyStays API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8080"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated string to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    # Stripe Configuration
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    # Database Configuration (if needed for future)
    DATABASE_URL: Optional[str] = None
    
    # Security Configuration
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Email Configuration (Resend)
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@hiddystays.com"
    FROM_NAME: str = "HiddyStays"
    SUPPORT_EMAIL: str = "support@hiddystays.com"
    APP_URL: str = "http://localhost:5173"
    
    # Admin Configuration
    DEFAULT_ADMIN_EMAIL: str = "admin@hiddystays.com"
    DEFAULT_ADMIN_PASSWORD: str = "AdminPassword123!"
    
    @field_validator('ENVIRONMENT')
    @classmethod
    def validate_environment(cls, v):
        allowed = ['development', 'staging', 'production']
        if v not in allowed:
            raise ValueError(f'Environment must be one of {allowed}')
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
