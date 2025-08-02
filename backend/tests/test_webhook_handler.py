"""
Testes para WebhookHandler - Processamento de webhooks
"""
import pytest
import hmac
import hashlib
import json
from unittest.mock import patch, MagicMock
from services.webhook_handler import WebhookHandler
from services.subscription_service import SubscriptionService
from schemas.payment_schemas import PaymentStatus

class TestWebhookHandler:
    """Testes do handler de webhooks"""
    
    def test_verify_signature_valid(self):
        """Teste de verificação de assinatura válida"""
        payload = '{"event": "PAYMENT_CONFIRMED"}'
        
        with patch('config.payments.PaymentConfig.ASAAS_WEBHOOK_SECRET', 'test_secret'):
            # Calcular assinatura correta
            secret = 'test_secret'.encode('utf-8')
            expected_signature = hmac.new(
                secret,
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            result = WebhookHandler.verify_signature(payload, expected_signature)
            assert result is True
    
    def test_verify_signature_invalid(self):
        """Teste de verificação de assinatura inválida"""
        payload = '{"event": "PAYMENT_CONFIRMED"}'
        invalid_signature = "invalid_signature"
        
        with patch('config.payments.PaymentConfig.ASAAS_WEBHOOK_SECRET', 'test_secret'):
            result = WebhookHandler.verify_signature(payload, invalid_signature)
            assert result is False
    
    def test_verify_signature_exception(self):
        """Teste de verificação com exceção"""
        # Forçar exceção passando None
        result = WebhookHandler.verify_signature(None, "signature")
        assert result is False
    
    def test_process_payment_webhook_confirmed(self, test_db):
        """Teste de processamento de webhook - pagamento confirmado"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_123456789",
                "customer": "cus_123456789",
                "status": "CONFIRMED",
                "value": 29.90
            }
        }
        
        with patch.object(SubscriptionService, 'process_payment_confirmation') as mock_service:
            mock_service.return_value = True
            
            result = WebhookHandler.process_payment_webhook(test_db, payload)
            
            assert result is True
            mock_service.assert_called_once_with(test_db, payload["payment"])
    
    def test_process_payment_webhook_failed(self, test_db):
        """Teste de processamento de webhook - pagamento falhado"""
        payload = {
            "event": "PAYMENT_FAILED",
            "payment": {
                "id": "pay_123456789",
                "customer": "cus_123456789",
                "status": "FAILED",
                "value": 29.90
            }
        }
        
        with patch.object(SubscriptionService, 'process_payment_failure') as mock_service:
            mock_service.return_value = True
            
            result = WebhookHandler.process_payment_webhook(test_db, payload)
            
            assert result is True
            mock_service.assert_called_once_with(test_db, payload["payment"])
    
    def test_process_payment_webhook_no_payment_data(self, test_db):
        """Teste de webhook sem dados de pagamento"""
        payload = {
            "event": "PAYMENT_CONFIRMED"
        }
        
        result = WebhookHandler.process_payment_webhook(test_db, payload)
        assert result is False
    
    def test_process_payment_webhook_unknown_event(self, test_db):
        """Teste de evento desconhecido"""
        payload = {
            "event": "UNKNOWN_EVENT",
            "payment": {
                "id": "pay_123456789",
                "status": "UNKNOWN"
            }
        }
        
        result = WebhookHandler.process_payment_webhook(test_db, payload)
        assert result is True  # Eventos desconhecidos retornam True (ignorados)
    
    def test_process_payment_webhook_exception(self, test_db):
        """Teste de exceção durante processamento"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_123456789"
            }
        }
        
        with patch.object(SubscriptionService, 'process_payment_confirmation') as mock_service:
            mock_service.side_effect = Exception("Database error")
            
            result = WebhookHandler.process_payment_webhook(test_db, payload)
            assert result is False
    
    def test_log_webhook(self):
        """Teste de log de webhook"""
        payload = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {"id": "pay_123"},
            "subscription": {"id": "sub_123"}
        }
        
        # Apenas verificar que não gera exceção
        WebhookHandler.log_webhook(payload, processed=True)
        WebhookHandler.log_webhook(payload, processed=False)
    
    def test_process_subscription_webhook(self, test_db):
        """Teste de processamento de webhook de assinatura"""
        payload = {
            "event": "SUBSCRIPTION_CREATED",
            "subscription": {
                "id": "sub_123456789",
                "customer": "cus_123456789",
                "status": "ACTIVE"
            }
        }
        
        result = WebhookHandler.process_subscription_webhook(test_db, payload)
        assert result is True
