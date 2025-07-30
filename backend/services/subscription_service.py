"""
Serviço de gerenciamento de assinaturas
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from models import Usuario, Assinatura
from schemas.payment_schemas import (
    SubscriptionCreate,
    SubscriptionUpdate, 
    SubscriptionResponse,
    PlanType,
    SubscriptionStatus
)
from .asaas_service import AsaasService
from config.payments import SUBSCRIPTION_PLANS

import logging
logger = logging.getLogger(__name__)

class SubscriptionService:
    """Serviço para gerenciar assinaturas dos usuários"""
    
    @staticmethod
    def create_subscription(
        db: Session,
        user_id: str,
        plan_type: PlanType,
        asaas_customer_id: str,
        asaas_subscription_id: Optional[str] = None
    ) -> Assinatura:
        """Criar nova assinatura"""
        
        # Verificar se usuário já tem assinatura ativa
        existing = SubscriptionService.get_active_subscription(db, user_id)
        if existing:
            raise ValueError("Usuário já possui assinatura ativa")
        
        # Calcular datas
        now = datetime.now()
        period_end = now + timedelta(days=30)  # Mensal por padrão
        
        subscription = Assinatura(
            id=str(uuid.uuid4()),
            id_usuario=user_id,
            tipo_plano=plan_type.value,
            status='ACTIVE',
            asaas_customer_id=asaas_customer_id,
            asaas_subscription_id=asaas_subscription_id,
            periodo_inicio=now,
            periodo_fim=period_end,
            criado_em=now,
            atualizado_em=now
        )
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        logger.info(f"Assinatura criada: {subscription.id} para usuário {user_id}")
        return subscription
    
    @staticmethod
    def get_subscription_by_id(db: Session, subscription_id: str) -> Optional[Assinatura]:
        """Buscar assinatura por ID"""
        return db.query(Assinatura).filter(Assinatura.id == subscription_id).first()
    
    @staticmethod
    def get_active_subscription(db: Session, user_id: str) -> Optional[Assinatura]:
        """Buscar assinatura ativa do usuário"""
        return db.query(Assinatura).filter(
            and_(
                Assinatura.id_usuario == user_id,
                Assinatura.status == 'ACTIVE',
                Assinatura.periodo_fim > datetime.now()
            )
        ).first()
    
    @staticmethod
    def get_user_subscriptions(db: Session, user_id: str) -> List[Assinatura]:
        """Buscar todas as assinaturas do usuário"""
        return db.query(Assinatura).filter(
            Assinatura.id_usuario == user_id
        ).order_by(Assinatura.criado_em.desc()).all()
    
    @staticmethod
    def update_subscription(
        db: Session,
        subscription_id: str,
        update_data: SubscriptionUpdate
    ) -> Assinatura:
        """Atualizar assinatura"""
        subscription = SubscriptionService.get_subscription_by_id(db, subscription_id)
        if not subscription:
            raise ValueError("Assinatura não encontrada")
        
        # Atualizar campos
        for field, value in update_data.dict(exclude_none=True).items():
            setattr(subscription, field, value)
        
        subscription.atualizado_em = datetime.now()
        
        db.commit()
        db.refresh(subscription)
        
        logger.info(f"Assinatura atualizada: {subscription_id}")
        return subscription
    
    @staticmethod
    def cancel_subscription(db: Session, subscription_id: str, user_id: str) -> bool:
        """Cancelar assinatura"""
        subscription = db.query(Assinatura).filter(
            and_(
                Assinatura.id == subscription_id,
                Assinatura.id_usuario == user_id
            )
        ).first()
        
        if not subscription:
            raise ValueError("Assinatura não encontrada")
        
        subscription.status = 'INACTIVE'
        subscription.cancelada_em = datetime.now()
        subscription.atualizado_em = datetime.now()
        
        db.commit()
        
        logger.info(f"Assinatura cancelada: {subscription_id}")
        return True
    
    @staticmethod
    def extend_subscription(
        db: Session,
        subscription_id: str,
        days: int = 30
    ) -> Assinatura:
        """Estender assinatura por X dias"""
        subscription = SubscriptionService.get_subscription_by_id(db, subscription_id)
        if not subscription:
            raise ValueError("Assinatura não encontrada")
        
        subscription.periodo_fim = subscription.periodo_fim + timedelta(days=days)
        subscription.atualizado_em = datetime.now()
        
        db.commit()
        db.refresh(subscription)
        
        logger.info(f"Assinatura estendida: {subscription_id} por {days} dias")
        return subscription
    
    @staticmethod
    def check_expiring_subscriptions(db: Session, days_ahead: int = 3) -> List[Assinatura]:
        """Buscar assinaturas que vencem em X dias"""
        target_date = datetime.now() + timedelta(days=days_ahead)
        
        return db.query(Assinatura).filter(
            and_(
                Assinatura.status == 'ACTIVE',
                Assinatura.periodo_fim <= target_date,
                Assinatura.periodo_fim > datetime.now()
            )
        ).all()
    
    @staticmethod
    def expire_subscriptions(db: Session) -> int:
        """Expirar assinaturas vencidas"""
        expired_subscriptions = db.query(Assinatura).filter(
            and_(
                Assinatura.status == 'ACTIVE',
                Assinatura.periodo_fim <= datetime.now()
            )
        ).all()
        
        count = 0
        for subscription in expired_subscriptions:
            subscription.status = 'EXPIRED'
            subscription.atualizado_em = datetime.now()
            count += 1
        
        db.commit()
        
        logger.info(f"Expiradas {count} assinaturas")
        return count
    
    @staticmethod
    def get_plan_info(plan_type: PlanType) -> dict:
        """Obter informações do plano"""
        plan = SUBSCRIPTION_PLANS.get(plan_type.value)
        if not plan:
            raise ValueError(f"Plano não encontrado: {plan_type}")
        return plan
    
    @staticmethod
    def user_has_access(db: Session, user_id: str, feature: str = None) -> bool:
        """Verificar se usuário tem acesso a uma funcionalidade"""
        subscription = SubscriptionService.get_active_subscription(db, user_id)
        
        if not subscription:
            return False  # Sem assinatura = sem acesso
        
        # TODO: Implementar lógica de features por plano
        plan_type = subscription.tipo_plano
        
        # Por enquanto, todos os planos pagos têm acesso total
        return plan_type in ['basic', 'pro', 'premium']
    
    @staticmethod
    def get_subscription_stats(db: Session) -> dict:
        """Estatísticas das assinaturas"""
        total = db.query(Assinatura).count()
        active = db.query(Assinatura).filter(Assinatura.status == 'ACTIVE').count()
        expired = db.query(Assinatura).filter(Assinatura.status == 'EXPIRED').count()
        cancelled = db.query(Assinatura).filter(Assinatura.status == 'INACTIVE').count()
        
        # Por plano
        basic = db.query(Assinatura).filter(
            and_(Assinatura.tipo_plano == 'basic', Assinatura.status == 'ACTIVE')
        ).count()
        pro = db.query(Assinatura).filter(
            and_(Assinatura.tipo_plano == 'pro', Assinatura.status == 'ACTIVE')
        ).count()
        premium = db.query(Assinatura).filter(
            and_(Assinatura.tipo_plano == 'premium', Assinatura.status == 'ACTIVE')
        ).count()
        
        return {
            'total': total,
            'active': active,
            'expired': expired,
            'cancelled': cancelled,
            'by_plan': {
                'basic': basic,
                'pro': pro,
                'premium': premium
            }
        }
