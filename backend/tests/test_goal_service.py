"""
Testes para o service de metas/goals
"""
import pytest
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from models import Usuario, Meta
from services.goal_service import GoalService
from schemas.goal_schemas import MetaCreate, MetaUpdate, MetaProgressUpdate, TipoMeta, CategoriaMeta
from utils.exceptions import NotFoundError, ValidationError


class TestGoalService:
    """Testes para o service de metas"""

    @pytest.fixture
    def user(self, test_db: Session) -> Usuario:
        """Fixture de usuário para testes"""
        user = Usuario(
            nome_completo="Test Usuario",
            email="test@example.com",
            telefone="11999999999",
            nome_usuario="testuser",
            senha="hashed_password"  # Campo obrigatório
        )
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        return user
        return Usuario
    
    @pytest.fixture
    def goal_data(self) -> MetaCreate:
        """Dados de teste para criação de meta"""
        return MetaCreate(
            title="Meta de Economia",
            description="Economizar para férias",
            category=CategoriaMeta.TRAVEL,
            targetValue=Decimal("5000.00"),
            deadline=datetime.now() + timedelta(days=365),
            currentValue=Decimal("1000.00")
        )
    
    def test_create_goal_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de criação de meta com sucesso"""
        meta = GoalService.create_goal(
            db=test_db,
            user_id=user.id,
            goal_data=goal_data
        )
        
        assert meta["id"] is not None
        assert meta["title"] == goal_data.title
        assert meta["category"] == goal_data.category.value
        assert meta["targetValue"] == goal_data.targetValue
        assert meta["currentValue"] == goal_data.currentValue
        assert meta["status"] == "active"
        assert meta["isCompleted"] is False
        assert meta["user_id"] == str(user.id)
        assert "created_at" in meta
        assert "updated_at" in meta
    
    def test_create_goal_without_initial_value(self, test_db: Session, user: Usuario):
        """Teste de criação de meta sem valor inicial"""
        goal_data = MetaCreate(
            title="Meta sem valor inicial",
            category=CategoriaMeta.EMERGENCY,
            targetValue=Decimal("2000.00"),
            deadline=datetime.now() + timedelta(days=180)
        )
        
        meta = GoalService.create_goal(
            db=test_db,
            user_id=user.id,
            goal_data=goal_data
        )
        
        assert meta["currentValue"] == Decimal("0.00")
        assert meta["progressPercentage"] == 0.0
    
    def test_create_goal_invalid_date(self, test_db: Session, user: Usuario):
        """Teste de criação de meta com data no passado"""
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            MetaCreate(
                title="Meta com data inválida",
                category=CategoriaMeta.TRAVEL,
                targetValue=Decimal("1000.00"),
                deadline=datetime.now() - timedelta(days=1)  # Data no passado
            )

    def test_get_user_goals_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de busca de metas do usuário"""
        # Criar algumas metas
        meta1 = GoalService.create_goal(test_db, user.id, goal_data)
        
        goal_data2 = goal_data.model_copy()
        goal_data2.title = "Meta 2"
        goal_data2.category = CategoriaMeta.PURCHASE
        meta2 = GoalService.create_goal(test_db, user.id, goal_data2)
        
        # Buscar metas
        metas = GoalService.get_user_goals(
            db=test_db,
            user_id=user.id
        )
        
        assert len(metas) == 2
        meta_ids = {meta["id"] for meta in metas}
        assert meta1["id"] in meta_ids
        assert meta2["id"] in meta_ids
    
    def test_get_user_goals_with_filters(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de busca de metas com filtros"""
        # Criar metas de tipos diferentes
        meta1 = GoalService.create_goal(test_db, user.id, goal_data)
        
        goal_data2 = goal_data.model_copy()
        goal_data2.title = "Meta de Gasto"
        goal_data2.category = CategoriaMeta.PURCHASE
        meta2 = GoalService.create_goal(test_db, user.id, goal_data2)
        
        # Buscar apenas metas de viagem
        metas_travel = GoalService.get_user_goals(
            db=test_db,
            user_id=user.id,
            categoria="travel"  # Usar categoria que foi criada
        )
        
        assert len(metas_travel) == 1
        assert metas_travel[0]["id"] == meta1["id"]
        assert metas_travel[0]["category"] == "travel"
        
        # Buscar apenas metas de compra
        metas_purchase = GoalService.get_user_goals(
            db=test_db,
            user_id=user.id,
            categoria="purchase"  # Usar categoria que foi criada
        )
        
        assert len(metas_purchase) == 1
        assert metas_purchase[0]["id"] == meta2["id"]
        assert metas_purchase[0]["category"] == "purchase"
    
    def test_get_user_goals_active_only(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de busca apenas metas ativas"""
        # Criar meta ativa
        meta1 = GoalService.create_goal(test_db, user.id, goal_data)
        
        # Criar e desativar meta
        goal_data2 = goal_data.model_copy()
        goal_data2.title = "Meta Inativa"
        meta2 = GoalService.create_goal(test_db, user.id, goal_data2)
        GoalService.deactivate_goal(test_db, user.id, meta2["id"])
        
        # Buscar apenas metas ativas
        metas_ativas = GoalService.get_user_goals(
            db=test_db,
            user_id=user.id,
            active_only=True
        )
        
        assert len(metas_ativas) == 1
        assert metas_ativas[0]["id"] == meta1["id"]
        assert metas_ativas[0]["status"] == "active"
        
        # Buscar todas as metas
        todas_metas = GoalService.get_user_goals(
            db=test_db,
            user_id=user.id,
            active_only=False
        )
        
        assert len(todas_metas) == 2
    
    def test_get_goal_by_id_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de busca de meta por ID"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        meta = GoalService.get_goal_by_id(
            db=test_db,
            goal_id=created_meta["id"],
            user_id=user.id
        )
        
        assert meta["id"] == created_meta["id"]
        assert meta["title"] == goal_data.title
        assert meta["user_id"] == str(user.id)
    
    def test_get_goal_by_id_not_found(self, test_db: Session, user: Usuario):
        """Teste de busca de meta inexistente"""
        with pytest.raises(NotFoundError):
            GoalService.get_goal_by_id(
                db=test_db,
                goal_id="non-existent-id",
                user_id=user.id
            )
    
    def test_get_goal_by_id_wrong_user(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de busca de meta de outro usuário"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        # Criar outro usuário
        other_user = Usuario(
            nome_completo="Other Usuario",
            email="other@example.com",
            telefone="11888888888",
            nome_usuario="otheruser",
            senha="hashed_password123"  # Usar senha já hashada
        )
        test_db.add(other_user)
        test_db.commit()
        
        # Tentar buscar meta do primeiro usuário com ID do segundo
        with pytest.raises(NotFoundError):
            GoalService.get_goal_by_id(
                db=test_db,
                goal_id=created_meta["id"],
                user_id=other_user.id
            )
    
    def test_update_goal_progress_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de atualização de progresso da meta"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        progress_data = MetaProgressUpdate(
            valor_adicional=Decimal("500.00"),
            observacoes="Depósito mensal"
        )
        
        updated_meta = GoalService.update_goal_progress(
            db=test_db,
            user_id=user.id,
            goal_id=created_meta["id"],
            progress_data=progress_data
        )
        
        expected_value = goal_data.currentValue + progress_data.valor_adicional
        assert updated_meta["currentValue"] == expected_value
        
        # Verificar cálculo de percentual
        expected_percentual = (float(expected_value) / float(goal_data.targetValue)) * 100
        assert abs(updated_meta["progressPercentage"] - expected_percentual) < 0.01
    
    def test_update_goal_progress_negative_result(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de atualização que resultaria em valor negativo"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        progress_data = MetaProgressUpdate(
            valor_adicional=Decimal("-2000.00")  # Maior que o valor atual
        )
        
        with pytest.raises(ValidationError) as exc_info:
            GoalService.update_goal_progress(
                db=test_db,
                user_id=user.id,
                goal_id=created_meta["id"],
                progress_data=progress_data
            )
        
        assert "negativo" in str(exc_info.value)
    
    def test_update_goal_progress_goal_reached(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de atualização que atinge a meta"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        # Adicionar valor suficiente para atingir a meta
        valor_para_atingir = goal_data.targetValue - goal_data.currentValue
        
        progress_data = MetaProgressUpdate(
            valor_adicional=valor_para_atingir
        )
        
        updated_meta = GoalService.update_goal_progress(
            db=test_db,
            user_id=user.id,
            goal_id=created_meta["id"],
            progress_data=progress_data
        )
        
        assert updated_meta["currentValue"] == goal_data.targetValue
        assert updated_meta["isCompleted"] is True
        assert updated_meta["progressPercentage"] == 100.0
    
    def test_update_goal_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de atualização de meta"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        update_data = MetaUpdate(
            title="Meta Atualizada",
            description="Nova descrição",
            targetValue=Decimal("6000.00")
        )
        
        updated_meta = GoalService.update_goal(
            db=test_db,
            user_id=user.id,
            goal_id=created_meta["id"],
            goal_data=update_data
        )
        
        assert updated_meta["title"] == update_data.title
        assert updated_meta["description"] == update_data.description
        assert updated_meta["targetValue"] == update_data.targetValue
        
        # Campos não alterados devem permanecer iguais
        assert updated_meta["category"] == goal_data.category.value
        assert updated_meta["currentValue"] == goal_data.currentValue
    
    def test_deactivate_goal_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de desativação de meta"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        deactivated_meta = GoalService.deactivate_goal(
            db=test_db,
            user_id=user.id,
            goal_id=created_meta["id"]
        )
        
        assert deactivated_meta["status"] == "paused"
        assert deactivated_meta["id"] == created_meta["id"]
    
    def test_reactivate_goal_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de reativação de meta"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        # Desativar primeiro
        GoalService.deactivate_goal(test_db, user.id, created_meta["id"])
        
        # Reativar
        reactivated_meta = GoalService.reactivate_goal(
            db=test_db,
            user_id=user.id,
            goal_id=created_meta["id"]
        )
        
        assert reactivated_meta["status"] == "active"
        assert reactivated_meta["id"] == created_meta["id"]
    
    def test_delete_goal_success(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de deleção de meta"""
        created_meta = GoalService.create_goal(test_db, user.id, goal_data)
        
        GoalService.delete_goal(
            db=test_db,
            user_id=user.id,
            goal_id=created_meta["id"]
        )
        
        # Verificar se foi deletada
        with pytest.raises(NotFoundError):
            GoalService.get_goal_by_id(
                db=test_db,
                goal_id=created_meta["id"],
                user_id=user.id
            )
    
    def test_pagination(self, test_db: Session, user: Usuario, goal_data: MetaCreate):
        """Teste de paginação"""
        # Criar várias metas
        created_metas = []
        for i in range(5):
            data = goal_data.model_copy()
            data.title = f"Meta {i+1}"
            meta = GoalService.create_goal(test_db, user.id, data)
            created_metas.append(meta)
        
        # Primeira página
        page1 = GoalService.get_user_goals(
            db=test_db,
            user_id=user.id,
            limit=2,
            offset=0
        )
        
        assert len(page1) == 2
        
        # Segunda página
        page2 = GoalService.get_user_goals(
            db=test_db,
            user_id=user.id,
            limit=2,
            offset=2
        )
        
        assert len(page2) == 2
        
        # IDs devem ser diferentes entre as páginas
        ids_page1 = {meta["id"] for meta in page1}
        ids_page2 = {meta["id"] for meta in page2}
        
        assert ids_page1.isdisjoint(ids_page2)
    
    def test_user_isolation(self, test_db: Session, goal_data: MetaCreate):
        """Teste de isolamento entre usuários"""
        # Criar dois usuários
        user1 = Usuario(
            nome_completo="Usuario 1", 
            email="user1@example.com", 
            telefone="11111111111", 
            nome_usuario="user1",
            senha="hashed_password1"
        )
        user2 = Usuario(
            nome_completo="Usuario 2", 
            email="user2@example.com", 
            telefone="11222222222", 
            nome_usuario="user2",
            senha="hashed_password2"
        )
        
        test_db.add_all([user1, user2])
        test_db.commit()
        
        # Criar meta para usuário 1
        meta1 = GoalService.create_goal(test_db, user1.id, goal_data)
        
        # Criar meta para usuário 2
        goal_data2 = goal_data.model_copy()
        goal_data2.title = "Meta do Usuario 2"
        meta2 = GoalService.create_goal(test_db, user2.id, goal_data2)
        
        # Usuário 1 deve ver apenas sua meta
        metas_user1 = GoalService.get_user_goals(test_db, user1.id)
        assert len(metas_user1) == 1
        assert metas_user1[0]["id"] == meta1["id"]
        
        # Usuário 2 deve ver apenas sua meta
        metas_user2 = GoalService.get_user_goals(test_db, user2.id)
        assert len(metas_user2) == 1
        assert metas_user2[0]["id"] == meta2["id"]
        
        # Usuário 1 não deve conseguir acessar meta do usuário 2
        with pytest.raises(NotFoundError):
            GoalService.get_goal_by_id(test_db, meta2["id"], user1.id)
