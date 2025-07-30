"""
Endpoints para pagamentos e assinaturas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from config.database import get_db
from services.asaas_service import AsaasService
from services.subscription_service import SubscriptionService
from services.webhook_handler import WebhookHandler
from schemas.payment_schemas import (
    CreateCustomerRequest,
    CreatePaymentRequest,
    CreateSubscriptionRequest,
    SubscriptionCreate,
    SubscriptionResponse,
    PlanType
)
from utils.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Pagamentos"])

# Instância do serviço Asaas
asaas_service = AsaasService()

@router.get("/plans")
async def get_available_plans():
    """Listar planos disponíveis"""
    from ..config.payments import SUBSCRIPTION_PLANS
    return {"plans": SUBSCRIPTION_PLANS}

@router.post("/customer", status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CreateCustomerRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar cliente no Asaas"""
    try:
        # Verificar se usuário já tem customer_id
        if hasattr(current_user, 'asaas_customer_id') and current_user.asaas_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário já possui conta no sistema de pagamentos"
            )
        
        # Criar cliente no Asaas
        customer = await asaas_service.create_customer(customer_data)
        
        # Salvar customer_id no usuário
        current_user.asaas_customer_id = customer.id
        db.commit()
        
        return {
            "customer_id": customer.id,
            "message": "Cliente criado com sucesso"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar cliente: {str(e)}"
        )

@router.post("/subscription", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    plan_type: PlanType,
    billing_type: str = "PIX",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar assinatura para o usuário"""
    try:
        # Verificar se usuário já tem assinatura ativa
        existing = SubscriptionService.get_active_subscription(db, current_user.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário já possui assinatura ativa"
            )
        
        # Verificar se tem customer_id
        if not hasattr(current_user, 'asaas_customer_id') or not current_user.asaas_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="É necessário criar conta de pagamento primeiro"
            )
        
        # Criar assinatura no Asaas
        asaas_subscription = await asaas_service.create_plan_subscription(
            current_user.asaas_customer_id,
            plan_type,
            billing_type
        )
        
        # Criar assinatura local
        subscription = SubscriptionService.create_subscription(
            db=db,
            user_id=current_user.id,
            plan_type=plan_type,
            asaas_customer_id=current_user.asaas_customer_id,
            asaas_subscription_id=asaas_subscription.id
        )
        
        return SubscriptionResponse.from_orm(subscription)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar assinatura: {str(e)}"
        )

@router.get("/subscription/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter assinatura atual do usuário"""
    subscription = SubscriptionService.get_active_subscription(db, current_user.id)
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não possui assinatura ativa"
        )
    
    return SubscriptionResponse.from_orm(subscription)

@router.get("/subscription/history", response_model=List[SubscriptionResponse])
async def get_subscription_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter histórico de assinaturas do usuário"""
    subscriptions = SubscriptionService.get_user_subscriptions(db, current_user.id)
    return [SubscriptionResponse.from_orm(sub) for sub in subscriptions]

@router.post("/subscription/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancelar assinatura"""
    try:
        # Buscar assinatura
        subscription = SubscriptionService.get_subscription_by_id(db, subscription_id)
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assinatura não encontrada"
            )
        
        if subscription.id_usuario != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não autorizado a cancelar esta assinatura"
            )
        
        # Cancelar no Asaas
        if subscription.asaas_subscription_id:
            await asaas_service.cancel_subscription(subscription.asaas_subscription_id)
        
        # Cancelar localmente
        SubscriptionService.cancel_subscription(db, subscription_id, current_user.id)
        
        return {"message": "Assinatura cancelada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cancelar assinatura: {str(e)}"
        )

@router.get("/health")
async def payment_health_check():
    """Verificar saúde do sistema de pagamentos"""
    try:
        health = await asaas_service.health_check()
        return health
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "now"
        }
