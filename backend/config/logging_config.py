"""
Configuração de logging
"""
import logging
import sys
from pathlib import Path
from config.settings import settings

def setup_logging():
    """Configura o sistema de logging"""
    
    # Criar diretório de logs se não existir
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configuração do formato
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configuração básica
    logging.basicConfig(
        level=logging.DEBUG if settings.DEBUG else logging.INFO,
        format=log_format,
        handlers=[
            # Console handler
            logging.StreamHandler(sys.stdout),
            # File handler
            logging.FileHandler(log_dir / "app.log", encoding="utf-8")
        ]
    )
    
    # Logger específico para a aplicação
    logger = logging.getLogger("rider_finance")
    
    # Silenciar logs desnecessários
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DEBUG else logging.WARNING
    )
    
    # Silenciar logs de watchfiles (muito verbosos)
    logging.getLogger("watchfiles.main").setLevel(logging.WARNING)
    
    # Silenciar logs de passlib (debug muito verboso)
    logging.getLogger("passlib").setLevel(logging.INFO)
    
    # Silenciar logs de httpcore/httpx (muito verbosos)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.INFO)
    
    # Silenciar logs de asyncio (debug desnecessário)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    
    return logger

# Configurar logging no import
setup_logging()

# Instância global do logger
logger = logging.getLogger("rider_finance")
