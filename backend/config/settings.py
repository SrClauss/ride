"""
Configurações do sistema
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Banco de dados
    DATABASE_URL: str = "sqlite:///./rider_finance.db"
    
    # JWT
    SECRET_KEY: str = "rider-finance-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Aplicação
    APP_NAME: str = "Rider Finance API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Trial period (days)
    TRIAL_PERIOD_DAYS: int = 7
    
    # Email (futuro)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Redis (futuro)
    REDIS_URL: Optional[str] = None
    
    # Timezone
    TIMEZONE: str = "America/Sao_Paulo"
    
    # Asaas (Pagamentos)
    ASAAS_API_KEY: Optional[str] = None
    ASAAS_BASE_URL: str = "https://sandbox.asaas.com/api/v3"
    ASAAS_WEBHOOK_SECRET: Optional[str] = None
    WEBHOOK_BASE_URL: str = "http://localhost:8000"
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True
    )

# Instância global das configurações
settings = Settings()
