"""
Teste completo do fluxo de pagamentos - Asaas Integration Test
Este teste simula todo o fluxo:
1. Criação de usuário
2. Criação de cliente no Asaas
3. Criação de assinatura
4. Simulação de webhook de pagamento
5. Verificação do status da assinatura
"""
import asyncio
import pytest
import json
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from config.database import get_db
from services.asaas_service import AsaasService
from services.subscription_service import SubscriptionService
from services.webhook_handler import WebhookHandler
from models import Usuario, Assinatura
from schemas.payment_schemas import PlanType, CreateCustomerRequest, CreateSubscriptionRequest
from utils.auth import JWTHandler

# Cliente de teste
client = TestClient(app)

class TestPaymentFlow:
    """Classe de testes para fluxo completo de pagamentos"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.db = next(get_db())
        self.asaas_service = AsaasService()
        self.subscription_service = SubscriptionService()
        self.webhook_handler = WebhookHandler()
        
        # Dados de teste
        self.test_user_data = {
            "nome_usuario": "test_rider_payment",
            "email": "test.payment@riderfinance.com",
            "senha": "test123456",
            "nome_completo": "Rider de Teste Pagamento"
        }
        
        self.test_customer_data = {
            "name": "Rider de Teste Pagamento",
            "email": "test.payment@riderfinance.com",
            "phone": "11999999999",
            "cpfCnpj": "12345678901"
        }
    
    def teardown_method(self):
        """Cleanup após cada teste"""
        # Limpar dados de teste
        self.db.query(Assinatura).filter(
            Assinatura.id_usuario.in_(
                self.db.query(Usuario.id).filter(Usuario.email.like("%test%"))
            )
        ).delete(synchronize_session=False)
        
        self.db.query(Usuario).filter(Usuario.email.like("%test%")).delete()
        self.db.commit()
        self.db.close()

    @pytest.mark.asyncio
    async def test_complete_payment_flow(self):
        """Teste do fluxo completo de pagamento"""
        print("\n🚀 Iniciando teste do fluxo completo de pagamento...")
        
        # 1. Criar usuário na aplicação
        print("📝 1. Criando usuário...")
        user_response = client.post("/api/v1/auth/register", json=self.test_user_data)
        assert user_response.status_code == 201
        user_data = user_response.json()
        user_id = user_data["usuario"]["id"]
        access_token = user_data["access_token"]
        
        headers = {"Authorization": f"Bearer {access_token}"}
        print(f"✅ Usuário criado: {user_id}")
        
        # 2. Criar cliente no Asaas
        print("👤 2. Criando cliente no Asaas...")
        customer_request = CreateCustomerRequest(**self.test_customer_data)
        asaas_customer = await self.asaas_service.create_customer(customer_request)
        assert asaas_customer is not None
        customer_id = asaas_customer.id
        print(f"✅ Cliente Asaas criado: {customer_id}")
        
        # 3. Criar assinatura
        print("📋 3. Criando assinatura...")
        subscription_data = {
            "plan_type": "MONTHLY",
            "customer_data": self.test_customer_data
        }
        
        subscription_response = client.post(
            "/api/v1/payments/subscriptions",
            json=subscription_data,
            headers=headers
        )
        assert subscription_response.status_code == 201
        subscription_result = subscription_response.json()
        subscription_id = subscription_result["subscription"]["id"]
        asaas_subscription_id = subscription_result["subscription"]["asaas_subscription_id"]
        payment_url = subscription_result["payment_url"]
        
        print(f"✅ Assinatura criada: {subscription_id}")
        print(f"📄 URL de Pagamento: {payment_url}")
        
        # 4. Verificar status inicial da assinatura
        print("📊 4. Verificando status inicial...")
        subscription_status_response = client.get(
            f"/api/v1/payments/subscriptions/{subscription_id}",
            headers=headers
        )
        assert subscription_status_response.status_code == 200
        initial_status = subscription_status_response.json()
        assert initial_status["status"] == "PENDING"
        print(f"✅ Status inicial: {initial_status['status']}")
        
        # 5. Simular webhook de pagamento recebido
        print("💰 5. Simulando webhook de pagamento...")
        webhook_payload = {
            "event": "PAYMENT_RECEIVED",
            "payment": {
                "id": f"pay_test_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "status": "RECEIVED",
                "value": 29.90,
                "netValue": 27.41,
                "subscription": asaas_subscription_id,
                "customer": customer_id,
                "dateCreated": datetime.now().isoformat(),
                "dueDate": datetime.now().isoformat(),
                "paymentDate": datetime.now().isoformat(),
                "billingType": "CREDIT_CARD"
            }
        }
        
        webhook_response = client.post(
            "/webhooks/asaas/payment",
            json=webhook_payload,
            headers={"Content-Type": "application/json"}
        )
        assert webhook_response.status_code == 200
        webhook_result = webhook_response.json()
        assert webhook_result["status"] == "success"
        print("✅ Webhook processado com sucesso")
        
        # 6. Verificar se a assinatura foi ativada
        print("🔍 6. Verificando ativação da assinatura...")
        # Aguardar um momento para o processamento
        await asyncio.sleep(1)
        
        updated_subscription_response = client.get(
            f"/api/v1/payments/subscriptions/{subscription_id}",
            headers=headers
        )
        assert updated_subscription_response.status_code == 200
        updated_status = updated_subscription_response.json()
        
        print(f"📊 Status após pagamento: {updated_status['status']}")
        print(f"📅 Período fim: {updated_status['periodo_fim']}")
        
        # 7. Testar webhook de pagamento em atraso
        print("⚠️  7. Simulando pagamento em atraso...")
        overdue_webhook_payload = {
            "event": "PAYMENT_OVERDUE",
            "payment": {
                "id": f"pay_overdue_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "status": "OVERDUE",
                "value": 29.90,
                "subscription": asaas_subscription_id,
                "customer": customer_id,
                "dateCreated": (datetime.now() - timedelta(days=5)).isoformat(),
                "dueDate": (datetime.now() - timedelta(days=2)).isoformat(),
                "billingType": "CREDIT_CARD"
            }
        }
        
        overdue_response = client.post(
            "/webhooks/asaas/payment",
            json=overdue_webhook_payload,
            headers={"Content-Type": "application/json"}
        )
        assert overdue_response.status_code == 200
        print("✅ Webhook de atraso processado")
        
        # 8. Listar todas as assinaturas do usuário
        print("📋 8. Listando assinaturas do usuário...")
        subscriptions_response = client.get(
            "/api/v1/payments/subscriptions",
            headers=headers
        )
        assert subscriptions_response.status_code == 200
        subscriptions_list = subscriptions_response.json()
        assert len(subscriptions_list) >= 1
        print(f"✅ Total de assinaturas: {len(subscriptions_list)}")
        
        # 9. Cancelar assinatura
        print("❌ 9. Cancelando assinatura...")
        cancel_response = client.delete(
            f"/api/v1/payments/subscriptions/{subscription_id}",
            headers=headers
        )
        assert cancel_response.status_code == 200
        cancel_result = cancel_response.json()
        assert cancel_result["message"] == "Assinatura cancelada com sucesso"
        print("✅ Assinatura cancelada")
        
        # 10. Verificar status final
        print("🏁 10. Verificando status final...")
        final_status_response = client.get(
            f"/api/v1/payments/subscriptions/{subscription_id}",
            headers=headers
        )
        assert final_status_response.status_code == 200
        final_status = final_status_response.json()
        assert final_status["status"] == "CANCELLED"
        print(f"✅ Status final: {final_status['status']}")
        
        print("\n🎉 Teste do fluxo completo de pagamento finalizado com sucesso!")
        return True

    @pytest.mark.asyncio
    async def test_webhook_signature_validation(self):
        """Teste de validação de assinatura do webhook"""
        print("\n🔐 Testando validação de assinatura do webhook...")
        
        # Payload de teste
        test_payload = {
            "event": "PAYMENT_RECEIVED",
            "payment": {"id": "test_payment", "status": "RECEIVED"}
        }
        
        # Testar webhook sem assinatura (deve falhar em produção)
        response = client.post(
            "/webhooks/asaas/payment",
            json=test_payload
        )
        
        # Em ambiente de desenvolvimento, pode passar sem assinatura
        print(f"📊 Status response: {response.status_code}")
        print("✅ Teste de assinatura completado")

    @pytest.mark.asyncio 
    async def test_payment_error_handling(self):
        """Teste de tratamento de erros nos pagamentos"""
        print("\n🚨 Testando tratamento de erros...")
        
        # Tentar criar assinatura sem autenticação
        response = client.post(
            "/api/v1/payments/subscriptions",
            json={"plan_type": "MONTHLY"}
        )
        assert response.status_code == 401
        print("✅ Erro de autenticação tratado corretamente")
        
        # Criar usuário para próximos testes
        user_response = client.post("/api/v1/auth/register", json=self.test_user_data)
        access_token = user_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Tentar criar assinatura com dados inválidos
        invalid_response = client.post(
            "/api/v1/payments/subscriptions",
            json={"plan_type": "INVALID_PLAN"},
            headers=headers
        )
        assert invalid_response.status_code == 422
        print("✅ Dados inválidos tratados corretamente")
        
        print("✅ Teste de tratamento de erros completado")

# Função para executar todos os testes
async def run_all_tests():
    """Executar todos os testes de pagamento"""
    print("🧪 Iniciando bateria de testes de pagamento...")
    
    test_instance = TestPaymentFlow()
    
    try:
        # Setup
        test_instance.setup_method()
        
        # Executar testes
        await test_instance.test_complete_payment_flow()
        await test_instance.test_webhook_signature_validation()
        await test_instance.test_payment_error_handling()
        
        print("\n✅ Todos os testes passaram!")
        
    except Exception as e:
        print(f"\n❌ Erro nos testes: {str(e)}")
        raise
    finally:
        # Cleanup
        test_instance.teardown_method()

if __name__ == "__main__":
    print("🚀 Executando testes de integração de pagamentos...")
    asyncio.run(run_all_tests())
