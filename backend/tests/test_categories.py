"""
Testes para categorias
"""
import pytest
from services.auth_service import AuthService
from services.category_service import CategoryService

class TestCategoryService:
    """Testes do serviço de categorias"""
    
    def test_create_default_categories(self, test_db, sample_user_data):
        """Teste de criação de categorias padrão"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        CategoryService.create_default_categories(test_db, user.id)
        
        categories = CategoryService.get_user_categories(test_db, user.id)
        assert len(categories) == 12  # 6 receitas + 6 despesas
        
        receitas = [cat for cat in categories if cat.tipo == "receita"]
        despesas = [cat for cat in categories if cat.tipo == "despesa"]
        
        assert len(receitas) == 6
        assert len(despesas) == 6
    
    def test_create_custom_category(self, test_db, sample_user_data, sample_category_data):
        """Teste de criação de categoria customizada"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        
        category = CategoryService.create_category(
            db=test_db,
            user_id=user.id,
            **sample_category_data
        )
        
        assert category.nome == sample_category_data["nome"]
        assert category.tipo == sample_category_data["tipo"]
        assert category.eh_padrao == False
        assert category.eh_ativa == True
    
    def test_get_categories_by_type(self, test_db, sample_user_data):
        """Teste de busca por tipo"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        CategoryService.create_default_categories(test_db, user.id)
        
        receitas = CategoryService.get_categories_by_type(test_db, user.id, "receita")
        despesas = CategoryService.get_categories_by_type(test_db, user.id, "despesa")
        
        assert len(receitas) == 6
        assert len(despesas) == 6
        
        for cat in receitas:
            assert cat.tipo == "receita"
        
        for cat in despesas:
            assert cat.tipo == "despesa"
    
    def test_update_category(self, test_db, sample_user_data, sample_category_data):
        """Teste de atualização de categoria"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        category = CategoryService.create_category(
            db=test_db,
            user_id=user.id,
            **sample_category_data
        )
        
        updated_category = CategoryService.update_category(
            db=test_db,
            category_id=category.id,
            user_id=user.id,
            nome="Nome Atualizado",
            cor="#FF0000"
        )
        
        assert updated_category.nome == "Nome Atualizado"
        assert updated_category.cor == "#FF0000"
    
    def test_duplicate_category_name(self, test_db, sample_user_data, sample_category_data):
        """Teste de categoria com nome duplicado"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        
        # Primeira categoria
        CategoryService.create_category(
            db=test_db,
            user_id=user.id,
            **sample_category_data
        )
        
        # Segunda categoria com mesmo nome deve falhar
        with pytest.raises(Exception):
            CategoryService.create_category(
                db=test_db,
                user_id=user.id,
                **sample_category_data
            )
