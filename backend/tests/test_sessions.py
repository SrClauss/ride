"""
Testes para sessões de trabalho
"""
import pytest
from datetime import datetime, timedelta
from services.auth_service import AuthService
from services.session_service import SessionService

class TestSessionService:
    """Testes do serviço de sessões"""
    
    @pytest.fixture(autouse=True)
    def setup(self, test_db, sample_user_data):
        """Setup para cada teste"""
        self.user = AuthService.register_user(db=test_db, **sample_user_data)
    
    def test_start_session(self, test_db):
        """Teste de início de sessão"""
        session = SessionService.start_session(
            db=test_db,
            user_id=self.user.id,
            descricao="Sessão de teste"
        )
        
        assert session.id_usuario == self.user.id
        assert session.observacoes == "Sessão de teste"  # Campo correto
        assert session.inicio is not None
        assert session.fim is None
        assert session.eh_ativa is True
    
    def test_end_session(self, test_db):
        """Teste de finalização de sessão"""
        # Iniciar sessão
        session = SessionService.start_session(
            db=test_db,
            user_id=self.user.id,
            descricao="Sessão para finalizar"
        )
        
        # Simular uma pequena duração
        session.inicio = session.inicio - timedelta(minutes=3)
        test_db.commit()
        
        # Finalizar sessão
        ended_session = SessionService.end_session(
            db=test_db,
            session_id=session.id,
            user_id=self.user.id
        )
        
        assert ended_session.fim is not None
        assert ended_session.eh_ativa is False
        assert ended_session.total_minutos is not None
        assert ended_session.total_minutos >= 0
    
    def test_get_active_session(self, test_db):
        """Teste de busca de sessão ativa"""
        # Não deve ter sessão ativa
        active_session = SessionService.get_active_session(test_db, self.user.id)
        assert active_session is None
        
        # Iniciar sessão
        session = SessionService.start_session(
            db=test_db,
            user_id=self.user.id,
            descricao="Sessão ativa"
        )
        
        # Deve retornar a sessão ativa
        active_session = SessionService.get_active_session(test_db, self.user.id)
        assert active_session is not None
        assert active_session.id == session.id
    
    def test_cannot_start_multiple_sessions(self, test_db):
        """Teste que impede múltiplas sessões ativas"""
        # Iniciar primeira sessão
        SessionService.start_session(
            db=test_db,
            user_id=self.user.id,
            descricao="Primeira sessão"
        )
        
        # Tentar iniciar segunda sessão deve falhar
        with pytest.raises(Exception):
            SessionService.start_session(
                db=test_db,
                user_id=self.user.id,
                descricao="Segunda sessão"
            )
    
    def test_get_user_sessions(self, test_db):
        """Teste de histórico de sessões"""
        # Criar e finalizar algumas sessões
        for i in range(3):
            session = SessionService.start_session(
                db=test_db,
                user_id=self.user.id,
                descricao=f"Sessão {i+1}"
            )
            
            # Simular uma pequena duração
            session.inicio = session.inicio - timedelta(minutes=2 + i)
            test_db.commit()
            
            SessionService.end_session(
                db=test_db,
                session_id=session.id,
                user_id=self.user.id
            )
        
        sessions = SessionService.get_user_sessions(test_db, self.user.id)
        assert len(sessions) == 3
    
    def test_get_sessions_summary(self, test_db):
        """Teste de resumo de sessões"""
        # Criar e finalizar algumas sessões
        for i in range(2):
            session = SessionService.start_session(
                db=test_db,
                user_id=self.user.id,
                descricao=f"Sessão {i+1}"
            )
            
            # Simular uma pequena duração adicionando tempo ao início
            session.inicio = session.inicio - timedelta(minutes=5 + i)
            test_db.commit()
            
            SessionService.end_session(
                db=test_db,
                session_id=session.id,
                user_id=self.user.id
            )
        
        summary = SessionService.get_sessions_summary(test_db, self.user.id)
        
        assert summary["total_sessoes"] == 2
        assert summary["tempo_total_minutos"] > 0
        assert summary["tempo_medio_minutos"] > 0
    
    def test_update_session_description(self, test_db):
        """Teste de atualização de descrição"""
        session = SessionService.start_session(
            db=test_db,
            user_id=self.user.id,
            descricao="Descrição original"
        )
        
        updated_session = SessionService.update_session(
            db=test_db,
            session_id=session.id,
            user_id=self.user.id,
            observacoes="Nova descrição"  # Campo correto
        )
        
        assert updated_session.observacoes == "Nova descrição"
