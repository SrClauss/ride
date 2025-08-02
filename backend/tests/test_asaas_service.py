"""
Testes para AsaasService - Integração com API de pagamentos
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
from services.asaas_service import AsaasService
from schemas.payment_schemas import CreateCustomerRequest, CreatePaymentRequest

class TestAsaasService:
    """Testes do serviço de integração com Asaas"""
    
    @pytest.fixture
    def asaas_service(self):
        """Setup do serviço Asaas"""
        with patch('config.settings.settings') as mock_settings:
            mock_settings.ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3"
            mock_settings.ASAAS_API_KEY = "test_api_key"
            return AsaasService()
    
    @pytest.mark.asyncio
    async def test_create_customer_success(self, asaas_service):
        """Teste de criação de cliente - sucesso"""
        mock_response = {
            "object": "customer",
            "id": "cus_123456789",
            "name": "João Silva",
            "email": "joao@email.com",
            "phone": "11999999999",
            "mobilePhone": "11999999999",
            "cpfCnpj": "12345678901",
            "dateCreated": "2024-01-01",
            "notificationDisabled": False,
            "state": "ACTIVE",
            "city": "São Paulo",
            "postalCode": "01000-000",
            "externalReference": None,
            "observations": None
        }
        
        with patch('httpx.AsyncClient.request') as mock_request:
            mock_request.return_value = MagicMock(
                status_code=200,
                json=lambda: mock_response
            )
            
            customer_data = CreateCustomerRequest(
                name="João Silva",
                email="joao@email.com",
                phone="11999999999",
                mobilePhone="11999999999",
                cpfCnpj="12345678901"
            )
            
            result = await asaas_service.create_customer(customer_data)
            
            assert result.id == "cus_123456789"
            assert result.name == "João Silva"
            assert result.email == "joao@email.com"
    
    @pytest.mark.asyncio
    async def test_create_customer_error(self, asaas_service):
        """Teste de criação de cliente - erro"""
        with patch('httpx.AsyncClient.request') as mock_request:
            mock_request.return_value = MagicMock(
                status_code=400,
                json=lambda: {"errors": [{"description": "Email já existe"}]}
            )
            
            customer_data = CreateCustomerRequest(
                name="João Silva",
                email="joao@email.com",
                phone="11999999999",
                mobilePhone="11999999999",
                cpfCnpj="12345678901"
            )
            
            with pytest.raises(Exception):
                await asaas_service.create_customer(customer_data)
    
    @pytest.mark.asyncio
    async def test_create_payment_success(self, asaas_service):
        """Teste de criação de cobrança - sucesso"""
        mock_response = {
            "object": "payment",
            "id": "pay_123456789",
            "value": 29.90,
            "status": "PENDING",
            "billingType": "PIX",
            "customer": "cus_123456789",
            "dueDate": "2024-01-01",
            "description": "Plano Premium",
            "subscription": None,
            "netValue": 29.90,
            "originalValue": 29.90,
            "interestValue": 0.0,
            "originalDueDate": "2024-01-01",
            "paymentDate": None,
            "clientPaymentDate": None,
            "externalReference": None,
            "invoiceUrl": None,
            "bankSlipUrl": None,
            "transactionReceiptUrl": None
        }
        
        with patch('httpx.AsyncClient.request') as mock_request:
            mock_request.return_value = MagicMock(
                status_code=200,
                json=lambda: mock_response
            )
            
            payment_data = CreatePaymentRequest(
                customer="cus_123456789",
                billingType="PIX",
                value=29.90,
                dueDate="2024-01-01",
                description="Plano Premium"
            )
            
            result = await asaas_service.create_payment(payment_data)
            
            assert result.id == "pay_123456789"
            assert result.value == 29.90
            assert result.status == "PENDING"
    
    @pytest.mark.asyncio
    async def test_get_payment_status(self, asaas_service):
        """Teste de consulta de status de pagamento"""
        mock_response = {
            "object": "payment",
            "id": "pay_123456789",
            "value": 29.90,
            "status": "CONFIRMED",
            "billingType": "PIX",
            "paymentDate": "2024-01-01",
            "customer": "cus_123456789",
            "subscription": None,
            "netValue": 29.90,
            "originalValue": 29.90,
            "interestValue": 0.0,
            "description": "Plano Premium",
            "dueDate": "2024-01-01",
            "originalDueDate": "2024-01-01",
            "clientPaymentDate": None,
            "externalReference": None,
            "invoiceUrl": None,
            "bankSlipUrl": None,
            "transactionReceiptUrl": None
        }
        
        with patch('httpx.AsyncClient.request') as mock_request:
            mock_request.return_value = MagicMock(
                status_code=200,
                json=lambda: mock_response
            )
            
            result = await asaas_service.get_payment("pay_123456789")
            
            assert result.id == "pay_123456789"
            assert result.status == "CONFIRMED"
    
    @pytest.mark.asyncio
    async def test_request_timeout_error(self, asaas_service):
        """Teste de timeout na requisição"""
        with patch('httpx.AsyncClient.request') as mock_request:
            mock_request.side_effect = httpx.TimeoutException("Timeout")
            
            customer_data = CreateCustomerRequest(
                name="João Silva",
                email="joao@email.com",
                phone="11999999999",
                mobilePhone="11999999999",
                cpfCnpj="12345678901"
            )
            
            with pytest.raises(Exception):
                await asaas_service.create_customer(customer_data)
    
    @pytest.mark.asyncio
    async def test_network_error(self, asaas_service):
        """Teste de erro de rede"""
        with patch('httpx.AsyncClient.request') as mock_request:
            mock_request.side_effect = httpx.ConnectError("Erro de conexão")
            
            with pytest.raises(Exception):
                await asaas_service.get_payment("pay_123456789")
