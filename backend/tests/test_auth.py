"""
Testes para autenticação
"""
import pytest
from services.auth_service import AuthService
from services.user_service import UserService
from services.category_service import CategoryService

class TestAuth:
    """Testes de autenticação"""
    
    def test_register_user(self, test_db, sample_user_data):
        """Teste de registro de usuário"""
        user = AuthService.register_user(
            db=test_db,
            **sample_user_data
        )
        
        assert user.nome_usuario == sample_user_data["nome_usuario"]
        assert user.email == sample_user_data["email"]
        assert user.eh_pago == False
        assert user.trial_termina_em is not None
    
    def test_authenticate_user(self, test_db, sample_user_data):
        """Teste de autenticação"""
        # Registrar usuário
        user = AuthService.register_user(db=test_db, **sample_user_data)
        
        # Autenticar
        auth_user = AuthService.authenticate_user(
            db=test_db,
            login=sample_user_data["email"],
            senha=sample_user_data["senha"]
        )
        
        assert auth_user.id == user.id
        assert auth_user.email == user.email
    
    def test_create_tokens(self, test_db, sample_user_data):
        """Teste de criação de tokens"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        
        access_token, refresh_token = AuthService.create_tokens(user)
        
        assert access_token is not None
        assert refresh_token is not None
        assert len(access_token) > 50
        assert len(refresh_token) > 50
    
    def test_duplicate_user_registration(self, test_db, sample_user_data):
        """Teste de usuário duplicado"""
        # Primeiro registro
        AuthService.register_user(db=test_db, **sample_user_data)
        
        # Segundo registro deve falhar
        with pytest.raises(Exception):
            AuthService.register_user(db=test_db, **sample_user_data)

class TestUserService:
    """Testes do serviço de usuário"""
    
    def test_create_default_settings(self, test_db, sample_user_data):
        """Teste de criação de configurações padrão"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        UserService.create_default_settings(test_db, user)
        
        settings = UserService.get_user_settings(test_db, user.id)
        assert len(settings) >= 8  # Pelo menos 8 configurações padrão
    
    def test_update_user_profile(self, test_db, sample_user_data):
        """Teste de atualização de perfil"""
        user = AuthService.register_user(db=test_db, **sample_user_data)
        
        updated_user = UserService.update_user_profile(
            db=test_db,
            user=user,
            nome_completo="Nome Atualizado",
            telefone="11999999999"
        )
        
        assert updated_user.nome_completo == "Nome Atualizado"
        assert updated_user.telefone == "11999999999"
