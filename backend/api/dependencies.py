"""
Dependencies para autenticação e autorização
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from config.database import get_db
from models import Usuario
from services.auth_service import AuthService
from utils.exceptions import UnauthorizedError, TrialExpiredError

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Dependency para obter usuário atual"""
    try:
        token = credentials.credentials
        user = AuthService.get_current_user(db, token)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """Dependency para usuário ativo (verifica trial/pagamento)"""
    try:
        AuthService.check_subscription_status(current_user)
        return current_user
    except TrialExpiredError:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Período de trial expirado. Assine para continuar usando."
        )

def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario | None:
    """Dependency para usuário opcional (não lança erro se não autenticado)"""
    try:
        token = credentials.credentials
        return AuthService.get_current_user(db, token)
    except:
        return None
