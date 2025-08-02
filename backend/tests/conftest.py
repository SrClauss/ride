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

@pytest.fixture
def sample_goal_data():
    """Dados de meta para testes"""
    return {
        "titulo": "Economizar para férias",
        "descricao": "Meta para juntar dinheiro para viagem de férias",
        "valor_objetivo": 5000.0,
        "data_limite": date.today() + relativedelta(months=6),
        "tipo": "mensal",
        "categoria": "receita"
    }

@pytest.fixture
def sample_goal_data_variations():
    """Variações de dados de metas para testes múltiplos"""
    return [
        {
            "titulo": "Economizar para casa",
            "descricao": "Meta para comprar casa própria",
            "valor_objetivo": 50000.0,
            "data_limite": date.today() + relativedelta(years=2),
            "tipo": "anual",
            "categoria": "receita"
        },
        {
            "titulo": "Pagar dívida cartão",
            "descricao": "Meta para quitar dívida do cartão de crédito",
            "valor_objetivo": 2500.0,
            "data_limite": date.today() + relativedelta(months=3),
            "tipo": "mensal",
            "categoria": "despesa"
        },
        {
            "titulo": "Emergência",
            "descricao": "Reserva de emergência",
            "valor_objetivo": 10000.0,
            "data_limite": date.today() + relativedelta(months=12),
            "tipo": "semanal",
            "categoria": "receita"
        }
    ]

@pytest.fixture
def expired_goal_data():
    """Dados de meta vencida para testes"""
    return {
        "titulo": "Meta vencida",
        "descricao": "Meta que já passou do prazo",
        "valor_objetivo": 1000.0,
        "data_limite": date.today() - timedelta(days=30),
        "tipo": "mensal",
        "categoria": "receita"
    }

@pytest.fixture
def near_deadline_goal_data():
    """Dados de meta próxima do prazo para testes"""
    return {
        "titulo": "Meta próxima do prazo",
        "descricao": "Meta que está próxima de vencer",
        "valor_objetivo": 1500.0,
        "data_limite": date.today() + timedelta(days=3),
        "tipo": "semanal",
        "categoria": "receita"
    }

@pytest.fixture
def completed_goal_data():
    """Dados de meta para ser concluída nos testes"""
    return {
        "titulo": "Meta para concluir",
        "descricao": "Meta que será concluída durante o teste",
        "valor_objetivo": 100.0,  # Valor baixo para facilitar conclusão
        "data_limite": date.today() + relativedelta(months=1),
        "tipo": "diaria",
        "categoria": "receita"
    }

@pytest.fixture
def invalid_goal_data_samples():
    """Samples de dados inválidos para testes de validação"""
    return [
        {
            # Título vazio
            "titulo": "",
            "descricao": "Descrição válida",
            "valor_objetivo": 1000.0,
            "data_limite": date.today() + relativedelta(months=1),
            "tipo": "mensal"
        },
        {
            # Valor zero
            "titulo": "Título válido",
            "descricao": "Descrição válida",
            "valor_objetivo": 0.0,
            "data_limite": date.today() + relativedelta(months=1),
            "tipo": "mensal"
        },
        {
            # Valor negativo
            "titulo": "Título válido",
            "descricao": "Descrição válida",
            "valor_objetivo": -500.0,
            "data_limite": date.today() + relativedelta(months=1),
            "tipo": "mensal"
        },
        {
            # Tipo inválido
            "titulo": "Título válido",
            "descricao": "Descrição válida",
            "valor_objetivo": 1000.0,
            "data_limite": date.today() + relativedelta(months=1),
            "tipo": "tipo_inexistente"
        },
        {
            # Data no passado
            "titulo": "Título válido",
            "descricao": "Descrição válida",
            "valor_objetivo": 1000.0,
            "data_limite": date.today() - timedelta(days=1),
            "tipo": "mensal"
        }
    ]
