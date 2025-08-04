"""
Serviço de autenticação
"""
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models import Usuario
from utils.helpers import hash_password, verify_password, now_utc, calculate_trial_end_date
from utils.auth import JWTHandler
from utils.exceptions import UnauthorizedError, ConflictError, ValidationError, TrialExpiredError
from config.logging_config import logger

class AuthService:
    """Serviço de autenticação e autorização"""
    
    @staticmethod
    def register_user(
        db: Session,
        nome_usuario: str,
        email: str,
        senha: str,
        nome_completo: Optional[str] = None,
        telefone: Optional[str] = None
    ) -> Usuario:
        """Registra novo usuário"""
        
        # Verifica se usuário já existe
        existing_user = db.query(Usuario).filter(
            or_(Usuario.email == email.lower(), Usuario.nome_usuario == nome_usuario.lower())
        ).first()
        
        if existing_user:
            if existing_user.email == email.lower():
                raise ConflictError("Email já está em uso")
            else:
                raise ConflictError("Nome de usuário já está em uso")
        
        # Cria novo usuário
        user = Usuario(
            nome_usuario=nome_usuario,
            email=email,
            senha=hash_password(senha),
            nome_completo=nome_completo,
            telefone=telefone,
            trial_termina_em=calculate_trial_end_date()
        )
        
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            
            logger.info(f"Usuário registrado: {user.nome_usuario}")
            return user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao registrar usuário: {str(e)}")
            raise ValidationError("Erro ao criar usuário")
    
    @staticmethod
    def authenticate_user(db: Session, login: str, senha: str) -> Usuario:
        """Autentica usuário por email ou nome de usuário"""
        
        user = db.query(Usuario).filter(
            or_(Usuario.email == login.lower(), Usuario.nome_usuario == login.lower())
        ).first()
        
        if not user or not verify_password(senha, user.senha):
            raise UnauthorizedError("Credenciais inválidas")
        
        logger.info(f"Usuário autenticado: {user.nome_usuario}")
        return user
    
    @staticmethod
    def create_tokens(user: Usuario) -> Tuple[str, str]:
        """Cria tokens de acesso e refresh"""
        
        token_data = {
            "sub": user.id,
            "username": user.nome_usuario,
            "email": user.email
        }
        
        access_token = JWTHandler.create_access_token(token_data)
        refresh_token = JWTHandler.create_refresh_token({"sub": user.id})
        
        return access_token, refresh_token
    
    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> str:
        """Cria novo token de acesso usando refresh token"""
        
        payload = JWTHandler.verify_token(refresh_token, "refresh")
        user_id = payload.get("sub")
        
        if not user_id:
            raise UnauthorizedError("Token de refresh inválido")
        
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise UnauthorizedError("Usuário não encontrado")
        
        token_data = {
            "sub": user.id,
            "username": user.nome_usuario,
            "email": user.email
        }
        
        return JWTHandler.create_access_token(token_data)
    
    @staticmethod
    def get_current_user(db: Session, token: str) -> Usuario:
        """Obtém usuário atual pelo token"""
        
        user_id = JWTHandler.get_user_id_from_token(token)
        
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise UnauthorizedError("Usuário não encontrado")
        
        return user
    
    @staticmethod
    def check_subscription_status(user: Usuario) -> None:
        """Verifica status da assinatura do usuário"""
        
        # Se é usuário pago, pode usar
        if user.eh_pago and user.status_pagamento == "ativo":
            return
        
        # Se trial ainda está válido, pode usar
        if user.trial_termina_em and now_utc() <= user.trial_termina_em:
            return
        
        # Trial expirado e sem pagamento
        raise TrialExpiredError()
    
    @staticmethod
    def change_password(db: Session, user: Usuario, senha_atual: str, nova_senha: str) -> None:
        """Altera senha do usuário"""
        
        if not verify_password(senha_atual, user.senha):
            raise UnauthorizedError("Senha atual incorreta")
        
        user.senha = hash_password(nova_senha)
        user.atualizado_em = now_utc()
        
        try:
            db.commit()
            logger.info(f"Senha alterada para usuário: {user.nome_usuario}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao alterar senha: {str(e)}")
            raise ValidationError("Erro ao alterar senha")

    @staticmethod
    def get_user_profile_with_totals(db: Session, user_id: str) -> dict:
        """Retorna perfil do usuário com totais calculados"""
        from sqlalchemy import func
        from models import Transacao
        
        # Buscar usuário
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise ValidationError("Usuário não encontrado")
        
        # Calcular total gasto (despesas)
        total_spent = db.query(func.coalesce(func.sum(Transacao.valor), 0.0)).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'despesa'
        ).scalar() or 0.0
        
        # Calcular total ganho (receitas)
        total_earned = db.query(func.coalesce(func.sum(Transacao.valor), 0.0)).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'receita'
        ).scalar() or 0.0
        
        # Retornar perfil completo
        profile = user.para_dict()
        profile.update({
            'total_spent': float(total_spent),
            'total_earned': float(total_earned)
        })
        
        return profile
