"""
Serviço para gerenciamento de sessões de trabalho
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from models import SessaoTrabalho, Usuario
from utils.exceptions import NotFoundError, ValidationError

class SessionService:
    """Serviço para operações com sessões de trabalho"""
    
    @staticmethod
    def start_session(
        db: Session,
        user_id: int,
        descricao: Optional[str] = None
    ) -> SessaoTrabalho:
        """Iniciar nova sessão de trabalho"""
        # Verificar se já existe sessão ativa
        active_session = SessionService.get_active_session(db, user_id)
        if active_session:
            raise ValidationError("Já existe uma sessão ativa. Finalize-a antes de iniciar uma nova.")
        
        session = SessaoTrabalho(
            id_usuario=user_id,
            observacoes=descricao,  # Usando campo correto
            inicio=datetime.now(),
            eh_ativa=True
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    
    @staticmethod
    def end_session(
        db: Session,
        session_id: int,
        user_id: int
    ) -> SessaoTrabalho:
        """Finalizar sessão de trabalho"""
        session = SessionService.get_session_by_id(db, session_id, user_id)
        
        if not session.eh_ativa:
            raise ValidationError("Sessão já foi finalizada")
        
        session.fim = datetime.now()
        session.eh_ativa = False
        
        # Calcular duração em minutos usando método do modelo
        session.calcular_duracao()
        
        db.commit()
        db.refresh(session)
        return session
    
    @staticmethod
    def get_active_session(db: Session, user_id: int) -> Optional[SessaoTrabalho]:
        """Buscar sessão ativa do usuário"""
        return db.query(SessaoTrabalho).filter(
            SessaoTrabalho.id_usuario == user_id,
            SessaoTrabalho.eh_ativa == True
        ).first()
    
    @staticmethod
    def get_session_by_id(
        db: Session,
        session_id: int,
        user_id: int
    ) -> SessaoTrabalho:
        """Buscar sessão por ID"""
        session = db.query(SessaoTrabalho).filter(
            SessaoTrabalho.id == session_id,
            SessaoTrabalho.id_usuario == user_id
        ).first()
        
        if not session:
            raise NotFoundError("Sessão não encontrada")
        
        return session
    
    @staticmethod
    def get_user_sessions(
        db: Session,
        user_id: int,
        limit: int = 50
    ) -> List[SessaoTrabalho]:
        """Buscar sessões do usuário"""
        return db.query(SessaoTrabalho).filter(
            SessaoTrabalho.id_usuario == user_id
        ).order_by(SessaoTrabalho.inicio.desc()).limit(limit).all()
    
    @staticmethod
    def update_session(
        db: Session,
        session_id: int,
        user_id: int,
        **kwargs
    ) -> SessaoTrabalho:
        """Atualizar dados da sessão"""
        session = SessionService.get_session_by_id(db, session_id, user_id)
        
        for key, value in kwargs.items():
            if hasattr(session, key) and value is not None:
                setattr(session, key, value)
        
        db.commit()
        db.refresh(session)
        return session
    
    @staticmethod
    def delete_session(
        db: Session,
        session_id: int,
        user_id: int
    ) -> bool:
        """Excluir sessão"""
        session = SessionService.get_session_by_id(db, session_id, user_id)
        
        db.delete(session)
        db.commit()
        return True
    
    @staticmethod
    def get_sessions_summary(db: Session, user_id: int) -> dict:
        """Resumo das sessões do usuário"""
        sessions = SessionService.get_user_sessions(db, user_id)
        
        total_sessions = len(sessions)
        completed_sessions = [s for s in sessions if not s.eh_ativa]
        
        total_minutes = sum(s.total_minutos or 0 for s in completed_sessions)
        avg_minutes = total_minutes / len(completed_sessions) if completed_sessions else 0
        
        # Sessão mais longa
        longest_session = max(completed_sessions, key=lambda s: s.total_minutos or 0) if completed_sessions else None
        
        return {
            "total_sessoes": total_sessions,
            "sessoes_completas": len(completed_sessions),
            "tempo_total_minutos": total_minutes,
            "tempo_medio_minutos": round(avg_minutes, 2),
            "sessao_mais_longa_minutos": longest_session.total_minutos if longest_session else 0,
            "tem_sessao_ativa": SessionService.get_active_session(db, user_id) is not None
        }
