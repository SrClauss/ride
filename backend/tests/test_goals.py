"""
Testes para metas financeiras
"""
import pytest
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from services.auth_service import AuthService
from services.goal_service import GoalService

class TestGoalService:
    """Testes do serviço de metas"""
    
    @pytest.fixture(autouse=True)
    def setup(self, test_db, sample_user_data):
        """Setup para cada teste"""
        self.user = AuthService.register_user(db=test_db, **sample_user_data)
    
    def test_create_goal(self, test_db):
        """Teste de criação de meta"""
        goal_data = {
            "titulo": "Economizar para férias",
            "valor_objetivo": 5000.0,
            "data_limite": date.today() + relativedelta(months=6),
            "tipo": "mensal"  # Tipo válido
        }
        
        goal = GoalService.create_goal(
            db=test_db,
            user_id=self.user.id,
            **goal_data
        )
        
        assert goal.titulo == goal_data["titulo"]
        assert goal.valor_alvo == goal_data["valor_objetivo"]  # Campo correto do modelo
        assert goal.id_usuario == self.user.id
        assert goal.valor_atual == 0.0
        assert goal.eh_ativa is True
    
    def test_update_goal_progress(self, test_db):
        """Teste de atualização do progresso da meta"""
        goal = GoalService.create_goal(
            db=test_db,
            user_id=self.user.id,
            titulo="Meta de teste",
            valor_objetivo=1000.0,
            data_limite=date.today() + relativedelta(months=3),
            tipo="mensal"  # Tipo válido
        )
        
        # Atualizar progresso
        updated_goal = GoalService.update_goal_progress(
            db=test_db,
            goal_id=goal.id,
            user_id=self.user.id,
            valor=250.0
        )
        
        assert updated_goal.valor_atual == 250.0
        assert updated_goal.progresso_percentual == 25.0
    
    def test_complete_goal(self, test_db):
        """Teste de conclusão de meta"""
        goal = GoalService.create_goal(
            db=test_db,
            user_id=self.user.id,
            titulo="Meta pequena",
            valor_objetivo=100.0,
            data_limite=date.today() + relativedelta(months=1),
            tipo="diaria"  # Tipo válido
        )
        
        # Completar meta
        completed_goal = GoalService.update_goal_progress(
            db=test_db,
            goal_id=goal.id,
            user_id=self.user.id,
            valor=100.0
        )
        
        assert completed_goal.valor_atual == 100.0
        assert completed_goal.progresso_percentual == 100.0
        assert completed_goal.eh_concluida is True
    
    def test_get_user_goals(self, test_db):
        """Teste de busca de metas do usuário"""
        # Criar múltiplas metas
        for i in range(3):
            GoalService.create_goal(
                db=test_db,
                user_id=self.user.id,
                titulo=f"Meta {i+1}",
                valor_objetivo=1000.0 * (i+1),
                data_limite=date.today() + relativedelta(months=i+1),
                tipo="semanal"  # Tipo válido
            )
        
        goals = GoalService.get_user_goals(test_db, self.user.id)
        assert len(goals) == 3
    
    def test_get_active_goals(self, test_db):
        """Teste de busca apenas metas ativas"""
        # Meta ativa
        active_goal = GoalService.create_goal(
            db=test_db,
            user_id=self.user.id,
            titulo="Meta ativa",
            valor_objetivo=1000.0,
            data_limite=date.today() + relativedelta(months=6),
            tipo="anual"  # Tipo válido
        )
        
        # Meta completa
        completed_goal = GoalService.create_goal(
            db=test_db,
            user_id=self.user.id,
            titulo="Meta completa",
            valor_objetivo=100.0,
            data_limite=date.today() + relativedelta(months=1),
            tipo="diaria"  # Tipo válido
        )
        
        # Completar uma meta
        GoalService.update_goal_progress(
            db=test_db,
            goal_id=completed_goal.id,
            user_id=self.user.id,
            valor=100.0
        )
        
        active_goals = GoalService.get_active_goals(test_db, self.user.id)
        assert len(active_goals) == 1
        assert active_goals[0].id == active_goal.id
    
    def test_delete_goal(self, test_db):
        """Teste de exclusão de meta"""
        goal = GoalService.create_goal(
            db=test_db,
            user_id=self.user.id,
            titulo="Meta para deletar",
            valor_objetivo=500.0,
            data_limite=date.today() + relativedelta(months=2),
            tipo="semanal"  # Tipo válido
        )
        
        GoalService.delete_goal(
            db=test_db,
            goal_id=goal.id,
            user_id=self.user.id
        )
        
        # Verificar se foi removida
        with pytest.raises(Exception):
            GoalService.get_goal_by_id(
                db=test_db,
                goal_id=goal.id,
                user_id=self.user.id
            )
