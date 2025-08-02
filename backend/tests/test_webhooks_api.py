"""
Testes para API de Webhooks
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
import hmac
import hashlib
from main import app

client = TestClient(app)

class TestWebhooksAPI:
    """Testes dos endpoints de webhooks"""
    
    def test_asaas_payment_webhook_success(self, test_db):
        """Teste de webhook de pagamento - sucesso"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_123456789",
                "status": "CONFIRMED",
                "value": 29.90
            }
        }
        
        # Calcular assinatura válida
        secret = "webhook_secret"
        payload_str = json.dumps(payload)
        signature = hmac.new(
            secret.encode('utf-8'),
            payload_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        with patch('services.webhook_handler.WebhookHandler.verify_signature') as mock_verify:
            mock_verify.return_value = True
            
            with patch('services.webhook_handler.WebhookHandler.process_payment_webhook') as mock_process:
                mock_process.return_value = True
                
                with patch('services.webhook_handler.WebhookHandler.log_webhook') as mock_log:
                    response = client.post(
                        "/api/webhooks/asaas/payment",
                        json=payload,
                        headers={"asaas-signature": signature}
                    )
                    
                    assert response.status_code == 200
                    data = response.json()
                    assert data["status"] == "processed"
                    
                    mock_verify.assert_called_once()
                    mock_process.assert_called_once()
                    mock_log.assert_called_once()
    
    def test_asaas_payment_webhook_invalid_signature(self, test_db):
        """Teste de webhook com assinatura inválida"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_123456789",
                "status": "CONFIRMED"
            }
        }
        
        with patch('services.webhook_handler.WebhookHandler.verify_signature') as mock_verify:
            mock_verify.return_value = False
            
            response = client.post(
                "/api/webhooks/asaas/payment",
                json=payload,
                headers={"asaas-signature": "invalid_signature"}
            )
            
            assert response.status_code == 401
            data = response.json()
            assert "Assinatura inválida" in data["detail"]
    
    def test_asaas_payment_webhook_no_signature(self, test_db):
        """Teste de webhook sem assinatura"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_123456789"
            }
        }
        
        with patch('services.webhook_handler.WebhookHandler.verify_signature') as mock_verify:
            mock_verify.return_value = False
            
            response = client.post(
                "/api/webhooks/asaas/payment",
                json=payload
            )
            
            assert response.status_code == 401
    
    def test_asaas_payment_webhook_processing_error(self, test_db):
        """Teste de erro no processamento do webhook"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_123456789"
            }
        }
        
        with patch('services.webhook_handler.WebhookHandler.verify_signature') as mock_verify:
            mock_verify.return_value = True
            
            with patch('services.webhook_handler.WebhookHandler.process_payment_webhook') as mock_process:
                mock_process.return_value = False
                
                response = client.post(
                    "/api/webhooks/asaas/payment",
                    json=payload,
                    headers={"asaas-signature": "valid_signature"}
                )
                
                assert response.status_code == 400
                data = response.json()
                assert "Erro ao processar webhook" in data["detail"]
    
    def test_asaas_payment_webhook_exception(self, test_db):
        """Teste de exceção no webhook"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_123456789"
            }
        }
        
        with patch('services.webhook_handler.WebhookHandler.verify_signature') as mock_verify:
            mock_verify.side_effect = Exception("Erro simulado")
            
            response = client.post(
                "/api/webhooks/asaas/payment",
                json=payload,
                headers={"asaas-signature": "signature"}
            )
            
            assert response.status_code == 500
    
    def test_asaas_subscription_webhook_success(self, test_db):
        """Teste de webhook de assinatura - sucesso"""
        payload = {
            "event": "SUBSCRIPTION_CREATED",
            "subscription": {
                "id": "sub_123456789",
                "status": "ACTIVE",
                "customer": "cus_123456789"
            }
        }
        
        with patch('services.webhook_handler.WebhookHandler.verify_signature') as mock_verify:
            mock_verify.return_value = True
            
            with patch('services.webhook_handler.WebhookHandler.process_subscription_webhook') as mock_process:
                mock_process.return_value = True
                
                response = client.post(
                    "/api/webhooks/asaas/subscription",
                    json=payload,
                    headers={"asaas-signature": "valid_signature"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "processed"
    
    def test_webhook_malformed_json(self, test_db):
        """Teste de webhook com JSON malformado"""
        response = client.post(
            "/api/webhooks/asaas/payment",
            content="invalid json",
            headers={"Content-Type": "application/json", "asaas-signature": "sig"}
        )
        
        assert response.status_code == 400
    
    def test_webhook_missing_event(self, test_db):
        """Teste de webhook sem campo event"""
        payload = {
            "payment": {
                "id": "pay_123456789"
            }
            # Sem campo 'event'
        }
        
        with patch('services.webhook_handler.WebhookHandler.verify_signature') as mock_verify:
            mock_verify.return_value = True
            
            with patch('services.webhook_handler.WebhookHandler.process_payment_webhook') as mock_process:
                mock_process.return_value = False
                
                response = client.post(
                    "/api/webhooks/asaas/payment",
                    json=payload,
                    headers={"asaas-signature": "valid_signature"}
                )
                
                assert response.status_code == 400
