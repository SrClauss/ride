"""
Testes para transações
"""
import pytest
from datetime import datetime
from services.auth_service import AuthService
from services.category_service import CategoryService
from services.transaction_service import TransactionService

class TestTransactionService:
    """Testes do serviço de transações"""
    
    @pytest.fixture(autouse=True)
    def setup(self, test_db, sample_user_data):
        """Setup para cada teste"""
        self.user = AuthService.register_user(db=test_db, **sample_user_data)
        CategoryService.create_default_categories(test_db, self.user.id)
        self.categories = CategoryService.get_user_categories(test_db, self.user.id)
        self.receita_category = next(cat for cat in self.categories if cat.tipo == "receita")
        self.despesa_category = next(cat for cat in self.categories if cat.tipo == "despesa")
    
    def test_create_transaction(self, test_db, sample_transaction_data):
        """Teste de criação de transação"""
        transaction_data = {
            **sample_transaction_data,
            "id_categoria": self.receita_category.id
        }
        
        transaction = TransactionService.create_transaction(
            db=test_db,
            user_id=self.user.id,
            **transaction_data
        )
        
        assert transaction.valor == sample_transaction_data["valor"]
        assert transaction.tipo == sample_transaction_data["tipo"]
        assert transaction.id_categoria == self.receita_category.id
        assert transaction.id_usuario == self.user.id
    
    def test_get_transactions_summary(self, test_db, sample_transaction_data):
        """Teste de resumo de transações"""
        # Criar receita
        TransactionService.create_transaction(
            db=test_db,
            user_id=self.user.id,
            id_categoria=self.receita_category.id,
            valor=100.0,
            tipo="receita",
            descricao="Receita teste"
        )
        
        # Criar despesa
        TransactionService.create_transaction(
            db=test_db,
            user_id=self.user.id,
            id_categoria=self.despesa_category.id,
            valor=30.0,
            tipo="despesa",
            descricao="Despesa teste"
        )
        
        summary = TransactionService.get_transactions_summary(test_db, self.user.id)
        
        assert summary["total_receitas"] == 100.0
        assert summary["total_despesas"] == 30.0
        assert summary["saldo"] == 70.0
        assert summary["count_receitas"] == 1
        assert summary["count_despesas"] == 1
    
    def test_get_user_transactions_with_pagination(self, test_db):
        """Teste de paginação"""
        # Criar várias transações
        for i in range(5):
            TransactionService.create_transaction(
                db=test_db,
                user_id=self.user.id,
                id_categoria=self.receita_category.id,
                valor=10.0 * (i + 1),
                tipo="receita",
                descricao=f"Transação {i+1}"
            )
        
        # Primeira página
        transactions, total = TransactionService.get_user_transactions(
            db=test_db,
            user_id=self.user.id,
            page=1,
            per_page=3
        )
        
        assert len(transactions) == 3
        assert total == 5
        
        # Segunda página
        transactions, total = TransactionService.get_user_transactions(
            db=test_db,
            user_id=self.user.id,
            page=2,
            per_page=3
        )
        
        assert len(transactions) == 2
        assert total == 5
    
    def test_update_transaction(self, test_db, sample_transaction_data):
        """Teste de atualização de transação"""
        transaction = TransactionService.create_transaction(
            db=test_db,
            user_id=self.user.id,
            id_categoria=self.receita_category.id,
            **sample_transaction_data
        )
        
        updated_transaction = TransactionService.update_transaction(
            db=test_db,
            transaction_id=transaction.id,
            user_id=self.user.id,
            valor=50.0,
            descricao="Descrição atualizada"
        )
        
        assert updated_transaction.valor == 50.0
        assert updated_transaction.descricao == "Descrição atualizada"
    
    def test_delete_transaction(self, test_db, sample_transaction_data):
        """Teste de exclusão de transação"""
        transaction = TransactionService.create_transaction(
            db=test_db,
            user_id=self.user.id,
            id_categoria=self.receita_category.id,
            **sample_transaction_data
        )
        
        TransactionService.delete_transaction(
            db=test_db,
            transaction_id=transaction.id,
            user_id=self.user.id
        )
        
        # Verificar se foi removida
        with pytest.raises(Exception):
            TransactionService.get_transaction_by_id(
                db=test_db,
                transaction_id=transaction.id,
                user_id=self.user.id
            )
