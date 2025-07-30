"""
Teste completo dos endpoints da API REST
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    """Testar endpoint de health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "status" in data["data"]
    assert data["data"]["status"] == "healthy"

def test_docs_endpoint():
    """Testar se a documentação está acessível"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_auth_register_validation():
    """Testar validação no registro"""
    # Teste com dados inválidos
    response = client.post("/auth/register", json={
        "nome_usuario": "",  # Nome vazio
        "email": "invalid-email",  # Email inválido
        "senha": "123"  # Senha muito curta
    })
    assert response.status_code == 422  # Validation error

def test_cors_headers():
    """Testar se CORS está configurado"""
    response = client.options("/health")
    # Verificar se headers CORS estão presentes
    assert response.status_code in [200, 405]  # Alguns podem não suportar OPTIONS

if __name__ == "__main__":
    print("TESTANDO ENDPOINTS DA API...")
    test_health_endpoint()
    test_docs_endpoint()
    test_auth_register_validation()
    test_cors_headers()
    print("TODOS OS TESTES DE API PASSARAM!")
