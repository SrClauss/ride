"""
Serviço para gerenciamento de metas financeiras
"""
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import Meta, Usuario
from utils.exceptions import NotFoundError, ValidationError

class GoalService:
    """Serviço para operações com metas"""
    
    @staticmethod
    def create_goal(
        db: Session,
        user_id: int,
        titulo: str,
        valor_objetivo: float,
        data_limite: date,
        tipo: str,
        descricao: Optional[str] = None
    ) -> Meta:
        """Criar nova meta"""
        goal = Meta(
            id_usuario=user_id,
            titulo=titulo,
            descricao=descricao,
            valor_alvo=valor_objetivo,
            valor_atual=0.0,
            data_fim=data_limite,
            tipo=tipo,
            categoria="receita",  # Categoria válida padrão
            data_inicio=datetime.now(),
            eh_ativa=True,
            eh_concluida=False
        )
        
        db.add(goal)
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def get_user_goals(
        db: Session,
        user_id: int,
        ativa: Optional[bool] = None
    ) -> List[Meta]:
        """Buscar metas do usuário"""
        query = db.query(Meta).filter(Meta.id_usuario == user_id)
        
        if ativa is not None:
            query = query.filter(Meta.eh_ativa == ativa)
        
        return query.order_by(Meta.criado_em.desc()).all()
    
    @staticmethod
    def get_active_goals(db: Session, user_id: int) -> List[Meta]:
        """Buscar apenas metas ativas (não concluídas)"""
        return db.query(Meta).filter(
            Meta.id_usuario == user_id,
            Meta.eh_ativa == True,
            Meta.eh_concluida == False
        ).order_by(Meta.criado_em.desc()).all()
    
    @staticmethod
    def get_completed_goals(db: Session, user_id: int) -> List[Meta]:
        """Buscar apenas metas concluídas"""
        return db.query(Meta).filter(
            Meta.id_usuario == user_id,
            Meta.eh_concluida == True
        ).order_by(Meta.concluida_em.desc()).all()
    
    @staticmethod
    def get_goal_by_id(
        db: Session,
        goal_id: str,
        user_id: str
    ) -> Meta:
        """Buscar meta por ID"""
        goal = db.query(Meta).filter(
            Meta.id == goal_id,
            Meta.id_usuario == user_id
        ).first()
        
        if not goal:
            raise NotFoundError("Meta não encontrada")
        
        return goal
    
    @staticmethod
    def update_goal_progress(
        db: Session,
        goal_id: str,
        user_id: str,
        valor: float
    ) -> Meta:
        """Atualizar progresso da meta"""
        goal = GoalService.get_goal_by_id(db, goal_id, user_id)
        
        goal.valor_atual = valor
        
        # Calcular progresso percentual usando property do modelo
        progresso = goal.progresso_percentual
        
        # Marcar como concluída se atingiu 100%
        if progresso >= 100:
            goal.eh_concluida = True
            goal.concluida_em = datetime.now()
        
        goal.atualizado_em = datetime.now()
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def update_goal(
        db: Session,
        goal_id: str,
        user_id: str,
        **kwargs
    ) -> Meta:
        """Atualizar dados da meta"""
        goal = GoalService.get_goal_by_id(db, goal_id, user_id)
        
        # Mapear nomes de campos se necessário
        field_mapping = {
            'valor_objetivo': 'valor_alvo',
            'data_limite': 'data_fim'
        }
        
        for key, value in kwargs.items():
            # Usar mapeamento se disponível, senão usar nome original
            field_name = field_mapping.get(key, key)
            if hasattr(goal, field_name) and value is not None:
                setattr(goal, field_name, value)
        
        goal.atualizado_em = datetime.now()
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def deactivate_goal(
        db: Session,
        goal_id: str,
        user_id: str
    ) -> Meta:
        """Desativar meta"""
        goal = GoalService.get_goal_by_id(db, goal_id, user_id)
        goal.eh_ativa = False
        goal.atualizado_em = datetime.now()
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def reactivate_goal(
        db: Session,
        goal_id: str,
        user_id: str
    ) -> Meta:
        """Reativar meta"""
        goal = GoalService.get_goal_by_id(db, goal_id, user_id)
        goal.eh_ativa = True
        goal.atualizado_em = datetime.now()
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def delete_goal(
        db: Session,
        goal_id: str,
        user_id: str
    ) -> bool:
        """Excluir meta"""
        goal = GoalService.get_goal_by_id(db, goal_id, user_id)
        
        db.delete(goal)
        db.commit()
        return True
    
    @staticmethod
    def get_goals_by_type(
        db: Session,
        user_id: str,
        tipo: str
    ) -> List[Meta]:
        """Buscar metas por tipo"""
        return db.query(Meta).filter(
            Meta.id_usuario == user_id,
            Meta.tipo == tipo
        ).order_by(Meta.criado_em.desc()).all()
    
    @staticmethod
    def get_goals_by_category(
        db: Session,
        user_id: str,
        categoria: str
    ) -> List[Meta]:
        """Buscar metas por categoria"""
        return db.query(Meta).filter(
            Meta.id_usuario == user_id,
            Meta.categoria == categoria
        ).order_by(Meta.criado_em.desc()).all()
    
    @staticmethod
    def get_goals_near_deadline(
        db: Session,
        user_id: str,
        days: int = 7
    ) -> List[Meta]:
        """Buscar metas próximas do prazo"""
        deadline_limit = date.today() + timedelta(days=days)
        
        return db.query(Meta).filter(
            Meta.id_usuario == user_id,
            Meta.eh_ativa == True,
            Meta.eh_concluida == False,
            Meta.data_fim <= deadline_limit,
            Meta.data_fim >= date.today()
        ).order_by(Meta.data_fim.asc()).all()
    
    @staticmethod
    def get_overdue_goals(
        db: Session,
        user_id: str
    ) -> List[Meta]:
        """Buscar metas vencidas"""
        return db.query(Meta).filter(
            Meta.id_usuario == user_id,
            Meta.eh_ativa == True,
            Meta.eh_concluida == False,
            Meta.data_fim < date.today()
        ).order_by(Meta.data_fim.asc()).all()
    
    @staticmethod
    def get_goals_statistics(
        db: Session,
        user_id: str
    ) -> Dict[str, Any]:
        """Calcular estatísticas das metas"""
        all_goals = db.query(Meta).filter(Meta.id_usuario == user_id).all()
        
        total = len(all_goals)
        active = len([g for g in all_goals if g.eh_ativa and not g.eh_concluida])
        completed = len([g for g in all_goals if g.eh_concluida])
        inactive = len([g for g in all_goals if not g.eh_ativa])
        
        total_target_value = sum(g.valor_alvo for g in all_goals)
        total_current_value = sum(g.valor_atual for g in all_goals if g.eh_concluida)
        
        completion_rate = round((completed / total * 100), 2) if total > 0 else 0.0
        
        return {
            "total": total,
            "active": active,
            "completed": completed,
            "inactive": inactive,
            "total_target_value": total_target_value,
            "total_current_value": total_current_value,
            "completion_rate": completion_rate
        }
    
    @staticmethod
    def get_goals_summary(db: Session, user_id: str) -> dict:
        """Resumo das metas do usuário"""
        goals = GoalService.get_user_goals(db, user_id)
        
        total_goals = len(goals)
        active_goals = len([g for g in goals if g.eh_ativa])
        completed_goals = len([g for g in goals if g.eh_concluida])
        
        total_objetivo = sum(g.valor_alvo for g in goals if g.eh_ativa)
        total_atual = sum(g.valor_atual for g in goals if g.eh_ativa)
        
        progresso_geral = (total_atual / total_objetivo * 100) if total_objetivo > 0 else 0
        
        return {
            "total_metas": total_goals,
            "metas_ativas": active_goals,
            "metas_concluidas": completed_goals,
            "valor_total_objetivo": total_objetivo,
            "valor_total_atual": total_atual,
            "progresso_geral": round(progresso_geral, 2)
        }
