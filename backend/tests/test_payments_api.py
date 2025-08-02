"""
Testes para API de Pagamentos
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
import json
from datetime import datetime, timedelta
from main import app
from services.auth_service import AuthService
from utils.auth import get_current_user
from schemas.payment_schemas import AsaasCustomerResponse, PlanType

client = TestClient(app)

class TestPaymentsAPI:
    """Testes dos endpoints de pagamentos"""
    
    @pytest.fixture(autouse=True)
    def setup(self, test_db, sample_user_data):
        """Setup para cada teste"""
        self.user = AuthService.register_user(db=test_db, **sample_user_data)
    
    def test_create_customer_success(self, test_db):
        """Teste de criação de cliente - sucesso"""
        customer_data = {
            "name": "João Silva",
            "email": "joao@email.com", 
            "phone": "11999999999",
            "mobilePhone": "11999999999",
            "cpfCnpj": "12345678901"
        }
        
        mock_response = AsaasCustomerResponse(
            id="cus_123456789",
            name="João Silva",
            email="joao@email.com",
            phone="11999999999",
            cpfCnpj="12345678901",
            dateCreated="2025-08-01"
        )
        
        with patch('services.asaas_service.AsaasService.create_customer') as mock_create:
            mock_create.return_value = mock_response
            
            # Mock da dependência de autenticação
            def mock_get_current_user():
                return self.user
            
            app.dependency_overrides[get_current_user] = mock_get_current_user
            
            try:
                response = client.post(
                    "/api/payments/customer",
                    json=customer_data,
                    headers={"Authorization": "Bearer test_token"}
                )
                
                if response.status_code != 201:
                    print(f"Erro na resposta: {response.status_code}")
                    print(f"Conteúdo: {response.text}")
                
            finally:
                app.dependency_overrides = {}
            
            assert response.status_code == 201
            data = response.json()
            assert data["customer_id"] == "cus_123456789"
            assert data["message"] == "Cliente criado com sucesso"
    
    def test_create_customer_validation_error(self, test_db):
        """Teste de criação de cliente - erro de validação"""
        customer_data = {
            "name": "",  # Nome vazio
            "email": "email_invalido",  # Email inválido
        }
        
        # Mock da dependência de autenticação
        def mock_get_current_user():
            return self.user
        
        app.dependency_overrides[get_current_user] = mock_get_current_user
        
        try:
            response = client.post(
                "/api/payments/customer",
                json=customer_data,
                headers={"Authorization": "Bearer test_token"}
            )
        finally:
            app.dependency_overrides = {}
        
        assert response.status_code == 422
    
    def test_create_payment_success(self, test_db):
        """Teste de criação de cobrança - sucesso"""
        payment_data = {
            "customer": "cus_123456789",
            "billingType": "PIX",
            "value": 29.90,
            "dueDate": "2024-12-31",
            "description": "Plano Premium"
        }
        
        mock_response = {
            "id": "pay_123456789",
            "value": 29.90,
            "status": "PENDING",
            "invoiceUrl": "https://asaas.com/invoice/123"
        }
        
        # Mock da dependência de autenticação
        def mock_get_current_user():
            user = self.user
            user.asaas_customer_id = "cus_123456789"
            return user
        
        app.dependency_overrides[get_current_user] = mock_get_current_user
        
        try:
            with patch('services.asaas_service.AsaasService.create_payment') as mock_create:
                mock_create.return_value = mock_response
                
                response = client.post(
                    "/api/payments/charges",
                    json=payment_data,
                    headers={"Authorization": "Bearer test_token"}
                )
        finally:
            app.dependency_overrides = {}
        
        assert response.status_code == 201
        data = response.json()
        assert data["payment_id"] == "pay_123456789"
        assert data["status"] == "PENDING"
    
    def test_get_payment_status(self, test_db):
        """Teste de consulta de status de pagamento"""
        payment_id = "pay_123456789"
        
        mock_response = {
            "id": "pay_123456789",
            "status": "CONFIRMED",
            "value": 29.90,
            "paymentDate": "2024-01-01"
        }
        
        # Mock da dependência de autenticação
        def mock_get_current_user():
            return self.user
        
        app.dependency_overrides[get_current_user] = mock_get_current_user
        
        try:
            with patch('services.asaas_service.AsaasService.get_payment') as mock_get:
                mock_get.return_value = mock_response
                
                response = client.get(
                    f"/api/payments/charges/{payment_id}",
                    headers={"Authorization": "Bearer test_token"}
                )
        finally:
            app.dependency_overrides = {}
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "CONFIRMED"
    
    def test_create_subscription_success(self, test_db):
        """Teste de criação de assinatura - sucesso"""
        plan_type = PlanType.PREMIUM
        
        mock_subscription = MagicMock()
        mock_subscription.id = "sub_123456789"
        mock_subscription.id_usuario = self.user.id
        mock_subscription.tipo_plano = "premium"
        mock_subscription.status = "ACTIVE"  # Usar o valor correto do enum
        mock_subscription.asaas_customer_id = "cus_123456789"
        mock_subscription.asaas_subscription_id = "asaas_sub_123"  # String, não MagicMock
        mock_subscription.periodo_inicio = datetime.now()
        mock_subscription.periodo_fim = datetime.now() + timedelta(days=30)
        mock_subscription.criado_em = datetime.now()
        mock_subscription.atualizado_em = datetime.now()
        
        mock_asaas_subscription = MagicMock()
        mock_asaas_subscription.id = "asaas_sub_123"
        
        # Mock da dependência de autenticação
        def mock_get_current_user():
            user = self.user
            user.asaas_customer_id = "cus_123456789"
            return user
        
        app.dependency_overrides[get_current_user] = mock_get_current_user
        
        try:
            with patch('services.asaas_service.AsaasService.create_plan_subscription') as mock_asaas:
                with patch('services.subscription_service.SubscriptionService.create_subscription') as mock_create:
                    with patch('services.subscription_service.SubscriptionService.get_active_subscription') as mock_get:
                        mock_get.return_value = None  # Não tem assinatura ativa
                        mock_asaas.return_value = mock_asaas_subscription
                        mock_create.return_value = mock_subscription
                        
                        response = client.post(
                            f"/api/payments/subscription?plan_type={plan_type.value}",
                            headers={"Authorization": "Bearer test_token"}
                        )
        finally:
            app.dependency_overrides = {}
        
        assert response.status_code == 201
    
    def test_cancel_subscription(self, test_db):
        """Teste de cancelamento de assinatura"""
        subscription_id = "sub_123456789"
        
        mock_subscription = MagicMock()
        mock_subscription.id = subscription_id
        mock_subscription.id_usuario = self.user.id
        mock_subscription.asaas_subscription_id = "asaas_sub_123"
        
        # Mock da dependência de autenticação
        def mock_get_current_user():
            return self.user
        
        app.dependency_overrides[get_current_user] = mock_get_current_user
        
        try:
            with patch('services.asaas_service.AsaasService.cancel_subscription') as mock_asaas_cancel:
                with patch('services.subscription_service.SubscriptionService.get_subscription_by_id') as mock_get:
                    with patch('services.subscription_service.SubscriptionService.cancel_subscription') as mock_cancel:
                        mock_get.return_value = mock_subscription
                        mock_asaas_cancel.return_value = None
                        mock_cancel.return_value = None
                        
                        response = client.post(
                            f"/api/payments/subscription/{subscription_id}/cancel",
                            headers={"Authorization": "Bearer test_token"}
                        )
        finally:
            app.dependency_overrides = {}
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Assinatura cancelada com sucesso"
    
    def test_unauthorized_access(self, test_db):
        """Teste de acesso não autorizado"""
        response = client.get("/api/payments/charges/pay_123")
        
        assert response.status_code == 403  # A API retorna 403 para acesso sem token
    
    def test_asaas_service_error(self, test_db):
        """Teste de erro no serviço Asaas"""
        customer_data = {
            "name": "João Silva",
            "email": "joao@email.com",
            "phone": "11999999999",
            "mobilePhone": "11999999999", 
            "cpfCnpj": "12345678901"
        }
        
        # Mock da dependência de autenticação
        def mock_get_current_user():
            return self.user
        
        app.dependency_overrides[get_current_user] = mock_get_current_user
        
        try:
            with patch('services.asaas_service.AsaasService.create_customer') as mock_create:
                mock_create.side_effect = Exception("Erro na API do Asaas")
                
                response = client.post(
                    "/api/payments/customer",
                    json=customer_data,
                    headers={"Authorization": "Bearer test_token"}
                )
        finally:
            app.dependency_overrides = {}
        
        assert response.status_code == 500
