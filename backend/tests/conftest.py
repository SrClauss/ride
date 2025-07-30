"""
Configuração base para testes
"""
import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from config.database import get_db
from models import Base
from main import app

# Banco de dados em memória para testes
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def test_db():
    """Cria banco de dados temporário para cada teste"""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Criar todas as tabelas
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db):
    """Cliente de teste FastAPI"""
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides.clear()

@pytest.fixture
def sample_user_data():
    """Dados de usuário para testes"""
    return {
        "nome_usuario": "teste_user",
        "email": "teste@exemplo.com",
        "senha": "senha123",
        "nome_completo": "Usuário de Teste"
    }

@pytest.fixture
def sample_category_data():
    """Dados de categoria para testes"""
    return {
        "nome": "Uber Test",
        "tipo": "receita",
        "icone": "fab fa-uber",
        "cor": "#000000"
    }

@pytest.fixture
def sample_transaction_data():
    """Dados de transação para testes"""
    return {
        "valor": 25.50,
        "tipo": "receita",
        "descricao": "Corrida de teste"
    }
