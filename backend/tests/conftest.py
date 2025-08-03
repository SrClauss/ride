"""
Configuração base para testes
"""
import pytest
import tempfile
import os
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from config.database import get_db
from models import Base
from main import app

"""
Configuração base para testes
"""
import pytest
import tempfile
import os
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from config.database import get_db, Base
from main import app

# Banco de dados em memória para testes
TEST_DATABASE_URL = "sqlite:///:memory:"

# Variáveis globais para manter o engine e session
test_engine = None
TestingSessionLocal = None


@pytest.fixture(scope="function", autouse=True)
def setup_test_db():
    """Configura o banco de dados para cada teste"""
    global test_engine, TestingSessionLocal
    
    # Criar engine com pooling static para garantir que seja o mesmo objeto em memória
    test_engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )
    
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )
    
    # Criar todas as tabelas
    Base.metadata.create_all(bind=test_engine)
    
    # Override da dependência
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield
    
    # Limpar após o teste
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


@pytest.fixture(scope="function")
def test_db():
    """Retorna uma sessão de banco de dados para testes"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client():
    """Cliente de teste FastAPI"""
    with TestClient(app) as c:
        yield c

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
