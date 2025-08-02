"""
Endpoints para webhooks
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
import json

from config.database import get_db
from services.webhook_handler import WebhookHandler

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/asaas/payment")
async def asaas_payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Webhook para pagamentos do Asaas"""
    try:
        # Obter payload
        payload = await request.json()
        
        # Obter assinatura do header
        signature = request.headers.get('asaas-signature', '')
        
        # Verificar assinatura
        raw_payload = await request.body()
        if not WebhookHandler.verify_signature(raw_payload.decode(), signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Assinatura inválida"
            )
        
        # Processar webhook
        success = WebhookHandler.process_payment_webhook(db, payload)
        
        # Log do webhook
        WebhookHandler.log_webhook(payload, success)
        
        if success:
            return {"status": "processed"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao processar webhook"
            )
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload JSON inválido"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/asaas/subscription")
async def asaas_subscription_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Webhook para assinaturas do Asaas"""
    try:
        # Obter payload
        payload = await request.json()
        
        # Obter assinatura do header
        signature = request.headers.get('asaas-signature', '')
        
        # Verificar assinatura
        raw_payload = await request.body()
        if not WebhookHandler.verify_signature(raw_payload.decode(), signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Assinatura inválida"
            )
        
        # Processar webhook
        success = WebhookHandler.process_subscription_webhook(db, payload)
        
        # Log do webhook
        WebhookHandler.log_webhook(payload, success)
        
        if success:
            return {"status": "processed"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao processar webhook"
            )
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload JSON inválido"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/test")
async def test_webhook():
    """Endpoint de teste para webhooks"""
    return {
        "message": "Webhook endpoint funcionando",
        "timestamp": "now"
    }
