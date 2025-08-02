"""
Handler para webhooks do Asaas
"""
import json
import hmac
import hashlib
import logging
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, Request

from config.payments import PaymentConfig
from schemas.payment_schemas import WebhookPayload, PaymentWebhookData, PaymentStatus
from services.subscription_service import SubscriptionService
from config.database import get_db

logger = logging.getLogger(__name__)

class WebhookHandler:
    """Handler para processar webhooks do Asaas"""
    
    @staticmethod
    def verify_signature(payload: str, signature: str) -> bool:
        """Verificar assinatura do webhook"""
        try:
            # Calcular hash HMAC
            secret = PaymentConfig.ASAAS_WEBHOOK_SECRET.encode('utf-8')
            calculated_signature = hmac.new(
                secret,
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Comparar assinaturas
            return hmac.compare_digest(signature, calculated_signature)
            
        except Exception as e:
            logger.error(f"Erro ao verificar assinatura do webhook: {str(e)}")
            return False
    
    @staticmethod
    def process_payment_webhook(db: Session, payload: Dict[str, Any]) -> bool:
        """Processar webhook de pagamento"""
        try:
            event = payload.get('event')
            payment_data = payload.get('payment', {})
            
            if not payment_data:
                logger.warning("Webhook sem dados de pagamento")
                return False
            
            payment_id = payment_data.get('id')
            subscription_id = payment_data.get('subscription')
            status = payment_data.get('status')
            
            logger.info(f"Processando webhook: {event} - Pagamento: {payment_id} - Status: {status}")
            
            # Processar evento baseado no status
            if event == 'PAYMENT_RECEIVED' or event == 'PAYMENT_CONFIRMED':
                return WebhookHandler._handle_payment_received(db, payment_data)
            elif event == 'PAYMENT_FAILED':
                return WebhookHandler._handle_payment_failed(db, payment_data)
            elif event == 'PAYMENT_OVERDUE':
                return WebhookHandler._handle_payment_overdue(db, payment_data)
            elif event == 'PAYMENT_DELETED':
                return WebhookHandler._handle_payment_deleted(db, payment_data)
            elif event == 'PAYMENT_RESTORED':
                return WebhookHandler._handle_payment_restored(db, payment_data)
            else:
                logger.info(f"Evento não processado: {event}")
                return True
                
        except Exception as e:
            logger.error(f"Erro ao processar webhook de pagamento: {str(e)}")
            return False
    
    @staticmethod
    def _handle_payment_received(db: Session, payment_data: Dict[str, Any]) -> bool:
        """Processar pagamento recebido"""
        try:
            # Chamar SubscriptionService para processar confirmação
            result = SubscriptionService.process_payment_confirmation(db, payment_data)
            
            subscription_id = payment_data.get('subscription')
            
            if subscription_id:
                from models import Assinatura
                # Buscar assinatura
                subscription = db.query(Assinatura).filter(
                    Assinatura.asaas_subscription_id == subscription_id
                ).first()
                
                if subscription:
                    # Ativar/estender assinatura
                    subscription.status = 'ACTIVE'
                    db.commit()
                    logger.info(f"Assinatura ativada: {subscription.id}")
                    
            return result
            
        except Exception as e:
            logger.error(f"Erro ao processar pagamento recebido: {str(e)}")
            return False
    
    @staticmethod
    def _handle_payment_failed(db: Session, payment_data: Dict[str, Any]) -> bool:
        """Processar pagamento falhado"""
        try:
            # Chamar SubscriptionService para processar falha
            result = SubscriptionService.process_payment_failure(db, payment_data)
            
            subscription_id = payment_data.get('subscription')
            
            if subscription_id:
                from models import Assinatura
                # Buscar assinatura
                subscription = db.query(Assinatura).filter(
                    Assinatura.asaas_subscription_id == subscription_id
                ).first()
                
                if subscription:
                    # Marcar como inativa por falha de pagamento
                    subscription.status = 'INACTIVE'
                    db.commit()
                    logger.warning(f"Assinatura suspensa por falha de pagamento: {subscription.id}")
                    
            return result
            
        except Exception as e:
            logger.error(f"Erro ao processar falha de pagamento: {str(e)}")
            return False
    
    @staticmethod
    def _handle_payment_overdue(db: Session, payment_data: Dict[str, Any]) -> bool:
        """Processar pagamento em atraso"""
        try:
            subscription_id = payment_data.get('subscription')
            
            if subscription_id:
                from models import Assinatura
                # Buscar assinatura
                subscription = db.query(Assinatura).filter(
                    Assinatura.asaas_subscription_id == subscription_id
                ).first()
                
                if subscription:
                    # Marcar como pendente/suspensa
                    logger.warning(f"Pagamento em atraso para assinatura: {subscription.id}")
                    
            return True
            
        except Exception as e:
            logger.error(f"Erro ao processar pagamento em atraso: {str(e)}")
            return False
    
    @staticmethod
    def _handle_payment_deleted(db: Session, payment_data: Dict[str, Any]) -> bool:
        """Processar pagamento deletado"""
        try:
            subscription_id = payment_data.get('subscription')
            
            if subscription_id:
                from models import Assinatura
                # Buscar assinatura
                subscription = db.query(Assinatura).filter(
                    Assinatura.asaas_subscription_id == subscription_id
                ).first()
                
                if subscription:
                    # Cancelar assinatura
                    SubscriptionService.cancel_subscription(db, subscription.id, subscription.id_usuario)
                    logger.info(f"Assinatura cancelada por pagamento deletado: {subscription.id}")
                    
            return True
            
        except Exception as e:
            logger.error(f"Erro ao processar pagamento deletado: {str(e)}")
            return False
    
    @staticmethod
    def _handle_payment_restored(db: Session, payment_data: Dict[str, Any]) -> bool:
        """Processar pagamento restaurado"""
        try:
            subscription_id = payment_data.get('subscription')
            
            if subscription_id:
                from models import Assinatura
                from schemas.payment_schemas import SubscriptionUpdate
                # Buscar assinatura
                subscription = db.query(Assinatura).filter(
                    Assinatura.asaas_subscription_id == subscription_id
                ).first()
                
                if subscription and subscription.status == 'INACTIVE':
                    # Reativar assinatura
                    update_data = SubscriptionUpdate(status='ACTIVE')
                    SubscriptionService.update_subscription(db, subscription.id, update_data)
                    logger.info(f"Assinatura reativada: {subscription.id}")
                    
            return True
            
        except Exception as e:
            logger.error(f"Erro ao processar pagamento restaurado: {str(e)}")
            return False
    
    @staticmethod
    def log_webhook(payload: Dict[str, Any], processed: bool = True) -> None:
        """Log do webhook para auditoria"""
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'event': payload.get('event'),
            'processed': processed,
            'payment_id': payload.get('payment', {}).get('id'),
            'subscription_id': payload.get('subscription', {}).get('id')
        }
        
        if processed:
            logger.info(f"Webhook processado com sucesso: {json.dumps(log_data)}")
        else:
            logger.error(f"Falha ao processar webhook: {json.dumps(log_data)}")
    
    @staticmethod  
    def process_subscription_webhook(db: Session, payload: Dict[str, Any]) -> bool:
        """Processar webhook de assinatura"""
        try:
            event = payload.get('event')
            subscription_data = payload.get('subscription', {})
            
            if not subscription_data:
                logger.warning("Webhook sem dados de assinatura")
                return False
                
            # Processar diferentes eventos de assinatura
            if event == 'SUBSCRIPTION_CREATED':
                return True
            elif event == 'SUBSCRIPTION_UPDATED':
                return True
            elif event == 'SUBSCRIPTION_CANCELLED':
                return True
            else:
                logger.warning(f"Evento de assinatura desconhecido: {event}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao processar webhook de assinatura: {str(e)}")
            return False