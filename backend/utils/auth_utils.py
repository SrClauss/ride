"""
Utilitários para autenticação
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import jwt

from ..config.database import get_db
from ..config.settings import JWT_SECRET_KEY, JWT_ALGORITHM
from ..models import Usuario

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Obter usuário atual através do token JWT"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Decodificar token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Buscar usuário no banco
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """Obter usuário atual ativo"""
    # Adicionar verificações adicionais se necessário
    # Por exemplo, verificar se conta está ativa, não banida, etc.
    
    return current_user

async def get_current_user_with_subscription(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Usuario:
    """Obter usuário atual e verificar se tem assinatura ativa"""
    from ..services.subscription_service import SubscriptionService
    
    # Verificar se tem assinatura ativa
    subscription = SubscriptionService.get_active_subscription(db, current_user.id)
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Assinatura ativa necessária para acessar este recurso"
        )
    
    return current_user

async def require_plan(minimum_plan: str = "basic"):
    """Decorator para exigir plano mínimo"""
    def decorator(
        current_user: Usuario = Depends(get_current_user_with_subscription),
        db: Session = Depends(get_db)
    ):
        from ..services.subscription_service import SubscriptionService
        
        # Hierarquia de planos
        plan_hierarchy = {
            "basic": 1,
            "pro": 2, 
            "premium": 3
        }
        
        subscription = SubscriptionService.get_active_subscription(db, current_user.id)
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Assinatura necessária"
            )
        
        user_plan_level = plan_hierarchy.get(subscription.tipo_plano, 0)
        required_level = plan_hierarchy.get(minimum_plan, 999)
        
        if user_plan_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Plano {minimum_plan} ou superior necessário"
            )
        
        return current_user
    
    return decorator

# Dependências específicas para planos
async def require_basic_plan(
    current_user: Usuario = Depends(require_plan("basic"))
) -> Usuario:
    """Requer plano básico ou superior"""
    return current_user

async def require_pro_plan(
    current_user: Usuario = Depends(require_plan("pro"))
) -> Usuario:
    """Requer plano pro ou superior"""
    return current_user

async def require_premium_plan(
    current_user: Usuario = Depends(require_plan("premium"))
) -> Usuario:
    """Requer plano premium"""
    return current_user
