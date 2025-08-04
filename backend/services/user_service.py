"""
Serviço de usuários
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from models import Usuario, Configuracao, CONFIGURACOES_PADRAO_USUARIO
from utils.helpers import now_utc
from utils.exceptions import NotFoundError, ValidationError, ConflictError
from config.logging_config import logger

class UserService:
    """Serviço para gestão de usuários"""
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Usuario:
        """Busca usuário por ID"""
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise NotFoundError("Usuário", user_id)
        return user
    
    @staticmethod
    def update_user_profile(
        db: Session,
        user: Usuario,
        nome_completo: Optional[str] = None,
        telefone: Optional[str] = None,
        veiculo: Optional[str] = None,
        data_inicio_atividade: Optional[datetime] = None
    ) -> Usuario:
        """Atualiza perfil do usuário"""
        
        if nome_completo is not None:
            user.nome_completo = nome_completo
        
        if telefone is not None:
            user.telefone = telefone
            
        if veiculo is not None:
            user.veiculo = veiculo
            
        if data_inicio_atividade is not None:
            user.data_inicio_atividade = data_inicio_atividade.date() if isinstance(data_inicio_atividade, datetime) else data_inicio_atividade
        
        user.atualizado_em = now_utc()
        
        try:
            db.commit()
            db.refresh(user)
            logger.info(f"Perfil atualizado para usuário: {user.nome_usuario}")
            return user
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar perfil: {str(e)}")
            raise ValidationError("Erro ao atualizar perfil")
    
    @staticmethod
    def create_default_settings(db: Session, user: Usuario) -> None:
        """Cria configurações padrão para usuário"""
        
        for config_data in CONFIGURACOES_PADRAO_USUARIO:
            config = Configuracao(
                id_usuario=user.id,
                chave=config_data["chave"],
                valor=config_data["valor"],
                categoria=config_data["categoria"],
                tipo_dado=config_data["tipo_dado"]
            )
            db.add(config)
        
        try:
            db.commit()
            logger.info(f"Configurações padrão criadas para usuário: {user.nome_usuario}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar configurações padrão: {str(e)}")
            raise ValidationError("Erro ao criar configurações padrão")
    
    @staticmethod
    def get_user_settings(db: Session, user_id: str) -> List[Configuracao]:
        """Obtém todas as configurações do usuário"""
        return db.query(Configuracao).filter(Configuracao.id_usuario == user_id).all()
    
    @staticmethod
    def get_user_setting(db: Session, user_id: str, chave: str) -> Optional[Configuracao]:
        """Obtém configuração específica do usuário"""
        return db.query(Configuracao).filter(
            Configuracao.id_usuario == user_id,
            Configuracao.chave == chave.lower()
        ).first()
    
    @staticmethod
    def update_user_setting(
        db: Session,
        user_id: str,
        chave: str,
        valor: str,
        categoria: Optional[str] = None,
        tipo_dado: Optional[str] = None
    ) -> Configuracao:
        """Atualiza ou cria configuração do usuário"""
        
        setting = UserService.get_user_setting(db, user_id, chave)
        
        if setting:
            # Atualiza existente
            setting.valor = valor
            if categoria:
                setting.categoria = categoria
            if tipo_dado:
                setting.tipo_dado = tipo_dado
            setting.atualizado_em = now_utc()
        else:
            # Cria nova
            setting = Configuracao(
                id_usuario=user_id,
                chave=chave.lower(),
                valor=valor,
                categoria=categoria or "geral",
                tipo_dado=tipo_dado or "string"
            )
            db.add(setting)
        
        try:
            db.commit()
            db.refresh(setting)
            logger.info(f"Configuração atualizada: {chave} para usuário {user_id}")
            return setting
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar configuração: {str(e)}")
            raise ValidationError("Erro ao atualizar configuração")
    
    @staticmethod
    def delete_user_setting(db: Session, user_id: str, chave: str) -> None:
        """Remove configuração do usuário"""
        
        setting = UserService.get_user_setting(db, user_id, chave)
        if not setting:
            raise NotFoundError("Configuração", chave)
        
        try:
            db.delete(setting)
            db.commit()
            logger.info(f"Configuração removida: {chave} para usuário {user_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao remover configuração: {str(e)}")
            raise ValidationError("Erro ao remover configuração")
    
    @staticmethod
    def get_user_stats(db: Session, user_id: str) -> Dict[str, Any]:
        """Obtém estatísticas básicas do usuário"""
        from models import Transacao, SessaoTrabalho, Meta
        
        # Total de transações
        total_transacoes = db.query(func.count(Transacao.id)).filter(
            Transacao.id_usuario == user_id
        ).scalar() or 0
        
        # Total de sessões
        total_sessoes = db.query(func.count(SessaoTrabalho.id)).filter(
            SessaoTrabalho.id_usuario == user_id
        ).scalar() or 0
        
        # Total de metas
        total_metas = db.query(func.count(Meta.id)).filter(
            Meta.id_usuario == user_id
        ).scalar() or 0
        
        # Metas concluídas
        metas_concluidas = db.query(func.count(Meta.id)).filter(
            Meta.id_usuario == user_id,
            Meta.eh_concluida == True
        ).scalar() or 0
        
        return {
            "total_transacoes": total_transacoes,
            "total_sessoes": total_sessoes,
            "total_metas": total_metas,
            "metas_concluidas": metas_concluidas,
            "taxa_conclusao_metas": (metas_concluidas / total_metas * 100) if total_metas > 0 else 0
        }
    
    @staticmethod
    def update_payment_status(
        db: Session,
        user_id: str,
        status_pagamento: str,
        id_pagamento: Optional[str] = None,
        metodo_pagamento: Optional[str] = None,
        tipo_assinatura: Optional[str] = None
    ) -> Usuario:
        """Atualiza status de pagamento do usuário"""
        
        user = UserService.get_user_by_id(db, user_id)
        
        user.status_pagamento = status_pagamento
        user.eh_pago = status_pagamento == "ativo"
        
        if id_pagamento:
            user.id_pagamento = id_pagamento
        if metodo_pagamento:
            user.metodo_pagamento = metodo_pagamento
        if tipo_assinatura:
            user.tipo_assinatura = tipo_assinatura
        
        user.atualizado_em = now_utc()
        
        try:
            db.commit()
            db.refresh(user)
            logger.info(f"Status de pagamento atualizado para usuário: {user.nome_usuario}")
            return user
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar status de pagamento: {str(e)}")
            raise ValidationError("Erro ao atualizar status de pagamento")
