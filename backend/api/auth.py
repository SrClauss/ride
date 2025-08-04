"""
Rotas de autenticação
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.auth_schemas import (
    UserRegister, UserLogin, TokenResponse, TokenRefresh,
    ChangePassword, UserProfile, UserUpdate
)
from services.auth_service import AuthService
from services.user_service import UserService
from services.category_service import CategoryService
from api.dependencies import get_current_user, get_current_active_user
from utils.helpers import ResponseFormatter
from utils.exceptions import RiderFinanceException
from config.logging_config import logger
from config.settings import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=dict)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Registra novo usuário"""
    try:
        # Registra usuário
        user = AuthService.register_user(
            db=db,
            nome_usuario=user_data.nome_usuario,
            email=user_data.email,
            senha=user_data.senha,
            nome_completo=user_data.nome_completo,
            telefone=user_data.telefone
        )
        
        # Cria configurações padrão
        UserService.create_default_settings(db, user)
        
        # Cria categorias padrão
        CategoryService.create_default_categories(db, user.id)
        
        # Cria tokens
        access_token, refresh_token = AuthService.create_tokens(user)
        
        return ResponseFormatter.success(
            data={
                "user": user.para_dict(),
                "tokens": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token_type": "bearer",
                    "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
                }
            },
            message="Usuário registrado com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro no registro: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.post("/login", response_model=dict)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Autentica usuário"""
    try:
        user = AuthService.authenticate_user(db, credentials.login, credentials.senha)
        access_token, refresh_token = AuthService.create_tokens(user)
        
        return ResponseFormatter.success(
            data={
                "user": user.para_dict(),
                "tokens": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token_type": "bearer",
                    "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
                }
            },
            message="Login realizado com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.post("/refresh", response_model=dict)
def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """Renova token de acesso"""
    try:
        access_token = AuthService.refresh_access_token(db, token_data.refresh_token)
        
        return ResponseFormatter.success(
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            },
            message="Token renovado com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao renovar token: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/me", response_model=dict)
def get_current_user_info(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém informações do usuário atual"""
    try:
        profile = AuthService.get_user_profile_with_totals(db, current_user.id)
        return ResponseFormatter.success(
            data=profile,
            message="Informações do usuário obtidas com sucesso"
        )
    except Exception as e:
        logger.error(f"Erro ao obter perfil do usuário: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.put("/me", response_model=dict)
def update_profile(
    user_data: UserUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza perfil do usuário"""
    try:
        updated_user = UserService.update_user_profile(
            db=db,
            user=current_user,
            nome_completo=user_data.nome_completo,
            telefone=user_data.telefone,
            veiculo=user_data.veiculo,
            data_inicio_atividade=user_data.data_inicio_atividade
        )
        
        # Retornar perfil com totais calculados
        profile = AuthService.get_user_profile_with_totals(db, updated_user.id)
        
        return ResponseFormatter.success(
            data=profile,
            message="Perfil atualizado com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao atualizar perfil: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.post("/change-password", response_model=dict)
def change_password(
    password_data: ChangePassword,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Altera senha do usuário"""
    try:
        AuthService.change_password(
            db=db,
            user=current_user,
            senha_atual=password_data.senha_atual,
            nova_senha=password_data.nova_senha
        )
        
        return ResponseFormatter.success(
            message="Senha alterada com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao alterar senha: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")
