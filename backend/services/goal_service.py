"""
Service para operações relacionadas a metas/goals
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_

from models import Meta, Usuario
from schemas.goal_schemas import MetaCreate, MetaUpdate, MetaProgressUpdate, TipoMeta, CategoriaMeta
from utils.exceptions import NotFoundError, ValidationError
from config.logging_config import logger


class GoalService:
    """Service para operações com metas"""

    @staticmethod
    def create_goal(db: Session, user_id: str, goal_data: MetaCreate) -> Dict[str, Any]:
        """Criar uma nova meta"""
        try:
            logger.info(f"Criando meta '{goal_data.title}' para usuário {user_id}")
            
            # Validações adicionais
            if goal_data.deadline and goal_data.deadline <= datetime.now():
                raise ValidationError("Deadline deve ser no futuro")
            
            # A categoria já vem no formato correto do enum
            categoria_value = goal_data.category.value
            
            # Mapear dados para o modelo existente
            meta = Meta(
                id_usuario=user_id,
                titulo=goal_data.title,
                descricao=goal_data.description,
                tipo="mensal",  # Padrão para todas as metas
                categoria=categoria_value,
                valor_alvo=float(goal_data.targetValue),
                valor_atual=float(goal_data.currentValue or Decimal("0.00")),
                data_inicio=datetime.now(),
                data_fim=goal_data.deadline,
                unidade="BRL"
            )
            
            db.add(meta)
            db.commit()
            db.refresh(meta)
            
            logger.info(f"Meta '{meta.titulo}' criada com ID {meta.id}")
            
            return GoalService._meta_to_dict(meta, categoria_meta=goal_data.category)
            
        except ValidationError:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar meta: {e}")
            raise e

    @staticmethod
    def get_user_goals(
        db: Session, 
        user_id: str, 
        active_only: bool = True,
        tipo: Optional[str] = None,
        categoria: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Buscar metas do usuário com filtros"""
        try:
            query = db.query(Meta).filter(Meta.id_usuario == user_id)
            
            # Filtro por ativa
            if active_only:
                query = query.filter(Meta.eh_ativa == True)
            
            # Filtro por categoria (ignorar tipo por enquanto, pois o modelo não tem)
            if categoria:
                query = query.filter(Meta.categoria == categoria)
            
            # Ordenação e paginação
            query = query.order_by(Meta.criado_em.desc())
            query = query.offset(offset).limit(limit)
            
            metas = query.all()
            
            return [GoalService._meta_to_dict(meta) for meta in metas]
            
        except Exception as e:
            logger.error(f"Erro ao buscar metas do usuário {user_id}: {e}")
            raise e

    @staticmethod
    def get_goal_by_id(db: Session, goal_id: str, user_id: str) -> Dict[str, Any]:
        """Buscar meta específica por ID"""
        try:
            meta = db.query(Meta).filter(
                and_(Meta.id == goal_id, Meta.id_usuario == user_id)
            ).first()
            
            if not meta:
                raise NotFoundError(f"Meta com ID {goal_id} não encontrada")
            
            return GoalService._meta_to_dict(meta)
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar meta {goal_id}: {e}")
            raise e

    @staticmethod
    def update_goal_progress(
        db: Session, 
        user_id: str, 
        goal_id: str, 
        progress_data: MetaProgressUpdate
    ) -> Dict[str, Any]:
        """Atualizar progresso de uma meta"""
        try:
            meta = db.query(Meta).filter(
                and_(Meta.id == goal_id, Meta.id_usuario == user_id)
            ).first()
            
            if not meta:
                raise NotFoundError(f"Meta com ID {goal_id} não encontrada")
            
            # Calcular novo valor
            novo_valor = meta.valor_atual + float(progress_data.valor_adicional)
            
            # Validar que não fica negativo
            if novo_valor < 0:
                raise ValidationError("O valor atual não pode ficar negativo")
            
            # Atualizar valores
            meta.valor_atual = novo_valor
            meta.atualizado_em = datetime.now()
            
            # Verificar se meta foi atingida
            if meta.valor_atual >= meta.valor_alvo and not meta.eh_concluida:
                meta.marcar_concluida()
            
            # Log da atualização se há observações
            if progress_data.observacoes:
                logger.info(f"Progresso da meta {goal_id}: {progress_data.observacoes}")
            
            db.commit()
            db.refresh(meta)
            
            logger.info(f"Progresso da meta {goal_id} atualizado: {progress_data.valor_adicional}")
            
            return GoalService._meta_to_dict(meta)
            
        except (NotFoundError, ValidationError):
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar progresso da meta {goal_id}: {e}")
            raise e

    @staticmethod
    def update_goal(
        db: Session, 
        user_id: str, 
        goal_id: str, 
        goal_data: MetaUpdate
    ) -> Dict[str, Any]:
        """Atualizar dados de uma meta"""
        try:
            meta = db.query(Meta).filter(
                and_(Meta.id == goal_id, Meta.id_usuario == user_id)
            ).first()
            
            if not meta:
                raise NotFoundError(f"Meta com ID {goal_id} não encontrada")
            
            # Mapear campos do schema para o modelo
            if goal_data.title is not None:
                meta.titulo = goal_data.title
            if goal_data.description is not None:
                meta.descricao = goal_data.description
            if goal_data.category is not None:
                meta.categoria = goal_data.category.value
            if goal_data.targetValue is not None:
                meta.valor_alvo = float(goal_data.targetValue)
            if goal_data.deadline is not None:
                meta.data_fim = goal_data.deadline
            
            # Validações adicionais
            if meta.data_fim and meta.data_fim <= datetime.now():
                raise ValidationError("Data limite deve ser no futuro")
            
            meta.atualizado_em = datetime.now()
            
            db.commit()
            db.refresh(meta)
            
            logger.info(f"Meta {goal_id} atualizada")
            
            return GoalService._meta_to_dict(meta)
            
        except (NotFoundError, ValidationError):
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar meta {goal_id}: {e}")
            raise e

    @staticmethod
    def deactivate_goal(db: Session, user_id: str, goal_id: str) -> Dict[str, Any]:
        """Desativar uma meta"""
        try:
            meta = db.query(Meta).filter(
                and_(Meta.id == goal_id, Meta.id_usuario == user_id)
            ).first()
            
            if not meta:
                raise NotFoundError(f"Meta com ID {goal_id} não encontrada")
            
            meta.eh_ativa = False
            meta.atualizado_em = datetime.now()
            
            db.commit()
            db.refresh(meta)
            
            logger.info(f"Meta {goal_id} desativada")
            
            return GoalService._meta_to_dict(meta)
            
        except NotFoundError:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao desativar meta {goal_id}: {e}")
            raise e

    @staticmethod
    def reactivate_goal(db: Session, user_id: str, goal_id: str) -> Dict[str, Any]:
        """Reativar uma meta"""
        try:
            meta = db.query(Meta).filter(
                and_(Meta.id == goal_id, Meta.id_usuario == user_id)
            ).first()
            
            if not meta:
                raise NotFoundError(f"Meta com ID {goal_id} não encontrada")
            
            meta.eh_ativa = True
            meta.atualizado_em = datetime.now()
            
            db.commit()
            db.refresh(meta)
            
            logger.info(f"Meta {goal_id} reativada")
            
            return GoalService._meta_to_dict(meta)
            
        except NotFoundError:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao reativar meta {goal_id}: {e}")
            raise e

    @staticmethod
    def delete_goal(db: Session, user_id: str, goal_id: str) -> None:
        """Deletar uma meta"""
        try:
            meta = db.query(Meta).filter(
                and_(Meta.id == goal_id, Meta.id_usuario == user_id)
            ).first()
            
            if not meta:
                raise NotFoundError(f"Meta com ID {goal_id} não encontrada")
            
            db.delete(meta)
            db.commit()
            
            logger.info(f"Meta {goal_id} deletada")
            
        except NotFoundError:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao deletar meta {goal_id}: {e}")
            raise e

    @staticmethod
    def _meta_to_dict(meta: Meta, tipo_meta: Optional[TipoMeta] = None, categoria_meta: Optional[CategoriaMeta] = None) -> Dict[str, Any]:
        """Converter Meta para dicionário compatível com frontend"""
        return {
            "id": str(meta.id),
            "user_id": str(meta.id_usuario),
            "title": meta.titulo,
            "description": meta.descricao,
            "category": categoria_meta.value if categoria_meta else meta.categoria,
            "targetValue": Decimal(str(meta.valor_alvo)),
            "currentValue": Decimal(str(meta.valor_atual)),
            "progressPercentage": meta.progresso_percentual,
            "isCompleted": meta.eh_concluida,
            "status": "completed" if meta.eh_concluida else ("active" if meta.eh_ativa else "paused"),
            "deadline": meta.data_fim,
            "created_at": meta.criado_em,
            "updated_at": meta.atualizado_em
        }
