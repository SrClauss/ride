"""
Serviço para gerenciamento de metas financeiras
"""
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session
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
            valor_alvo=valor_objetivo,  # Usando nome correto do campo
            valor_atual=0.0,
            data_fim=data_limite,  # Usando nome correto do campo
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
    def get_goal_by_id(
        db: Session,
        goal_id: int,
        user_id: int
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
        goal_id: int,
        user_id: int,
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
        
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def update_goal(
        db: Session,
        goal_id: int,
        user_id: int,
        **kwargs
    ) -> Meta:
        """Atualizar dados da meta"""
        goal = GoalService.get_goal_by_id(db, goal_id, user_id)
        
        for key, value in kwargs.items():
            if hasattr(goal, key) and value is not None:
                setattr(goal, key, value)
        
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def delete_goal(
        db: Session,
        goal_id: int,
        user_id: int
    ) -> bool:
        """Excluir meta"""
        goal = GoalService.get_goal_by_id(db, goal_id, user_id)
        
        db.delete(goal)
        db.commit()
        return True
    
    @staticmethod
    def get_goals_summary(db: Session, user_id: int) -> dict:
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
