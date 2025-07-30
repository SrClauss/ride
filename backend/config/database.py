"""
Configuração do banco de dados
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# Importar Base dos modelos
from models import Base

# Motor do banco de dados
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Sessão local do banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency para obter sessão do banco"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Cria todas as tabelas do banco"""
    Base.metadata.create_all(bind=engine)
