#!/usr/bin/env python3
"""
Demo Helpers - Funções Auxiliares para Ambiente Demo
====================================================

Este módulo contém funções auxiliares para facilitar o trabalho com
o ambiente de demonstração do Rider Finance.

Funcionalidades:
- Credenciais padronizadas do usuário demo
- Validação de integridade dos dados
- Reset rápido de dados
- Login automático para testes
- Utilitários para desenvolvimento

Usado por scripts, testes e endpoints de desenvolvimento.
"""

import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import text

from models import Usuario, Categoria, Meta, Transacao, SessaoTrabalho
from config.database import SessionLocal
from utils.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)

# Constantes do usuário demo
DEMO_EMAIL = "demo@riderfinance.com"
DEMO_PASSWORD = "demo123"
DEMO_USERNAME = "rider_demo"
DEMO_FULL_NAME = "João Motorista Demo"


class DemoHelpers:
    """Classe com funções auxiliares para o ambiente demo"""
    
    def __init__(self, db: Optional[Session] = None):
        self.db = db or SessionLocal()
        self._should_close_db = db is None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._should_close_db:
            self.db.close()
    
    def get_demo_user_credentials(self) -> Dict[str, str]:
        """
        Retorna credenciais padronizadas do usuário demo
        
        Returns:
            Dict com email, senha e outros dados do usuário demo
        """
        return {
            'email': DEMO_EMAIL,
            'password': DEMO_PASSWORD,
            'username': DEMO_USERNAME,
            'full_name': DEMO_FULL_NAME,
            'phone': '(11) 99999-9999',
            'vehicle': 'Honda Civic 2020 - ABC-1234',
            'subscription_type': 'premium'
        }
    
    def get_demo_user(self) -> Optional[Usuario]:
        """
        Busca o usuário demo no banco
        
        Returns:
            Objeto Usuario ou None se não encontrado
        """
        try:
            user = self.db.query(Usuario).filter(
                Usuario.email == DEMO_EMAIL
            ).first()
            return user
        except Exception as e:
            logger.error(f"Erro buscando usuário demo: {e}")
            return None
    
    def validate_demo_data(self) -> Dict[str, bool]:
        """
        Valida integridade dos dados demo
        
        Returns:
            Dict com status de cada validação
        """
        validations = {}
        
        try:
            # Validar usuário
            user = self.get_demo_user()
            validations['user_exists'] = user is not None
            
            if user:
                user_id = user.id
                
                # Validar categorias
                cat_count = self.db.query(Categoria).filter(
                    Categoria.id_usuario == user_id
                ).count()
                validations['categories_exist'] = cat_count >= 5
                validations['categories_count'] = cat_count
                
                # Validar transações
                trans_count = self.db.query(Transacao).filter(
                    Transacao.id_usuario == user_id
                ).count()
                validations['transactions_exist'] = trans_count >= 100
                validations['transactions_count'] = trans_count
                
                # Validar metas
                goals_count = self.db.query(Meta).filter(
                    Meta.id_usuario == user_id
                ).count()
                validations['goals_exist'] = goals_count >= 3
                validations['goals_count'] = goals_count
                
                # Validar sessões
                sessions_count = self.db.query(SessaoTrabalho).filter(
                    SessaoTrabalho.id_usuario == user_id
                ).count()
                validations['sessions_count'] = sessions_count
                
                # Validação geral
                validations['all_valid'] = all([
                    validations['user_exists'],
                    validations['categories_exist'],
                    validations['transactions_exist'],
                    validations['goals_exist']
                ])
            else:
                validations['all_valid'] = False
                
        except Exception as e:
            logger.error(f"Erro na validação: {e}")
            validations['error'] = str(e)
            validations['all_valid'] = False
        
        return validations
    
    def get_demo_statistics(self) -> Dict:
        """
        Coleta estatísticas detalhadas dos dados demo
        
        Returns:
            Dict com estatísticas completas
        """
        stats = {}
        
        try:
            user = self.get_demo_user()
            if not user:
                return {'error': 'Usuário demo não encontrado'}
            
            user_id = user.id
            
            # Estatísticas básicas
            stats['user'] = {
                'id': str(user_id),
                'name': user.nome_completo,
                'email': user.email,
                'subscription': user.tipo_assinatura,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
            
            # Categorias
            categories = self.db.query(Categoria).filter(
                Categoria.id_usuario == user_id
            ).all()
            
            stats['categories'] = {
                'total': len(categories),
                'receitas': len([c for c in categories if c.tipo == 'receita']),
                'despesas': len([c for c in categories if c.tipo == 'despesa']),
                'list': [{'nome': c.nome, 'tipo': c.tipo} for c in categories]
            }
            
            # Transações
            transactions_data = self.db.execute(text("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN tipo = 'receita' THEN 1 END) as receitas_count,
                    COUNT(CASE WHEN tipo = 'despesa' THEN 1 END) as despesas_count,
                    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receitas,
                    SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesas,
                    MIN(data_transacao) as primeira_transacao,
                    MAX(data_transacao) as ultima_transacao
                FROM transacoes 
                WHERE id_usuario = :user_id
            """), {'user_id': user_id}).fetchone()
            
            if transactions_data:
                stats['transactions'] = {
                    'total': transactions_data.total,
                    'receitas_count': transactions_data.receitas_count,
                    'despesas_count': transactions_data.despesas_count,
                    'total_receitas': float(transactions_data.total_receitas or 0),
                    'total_despesas': float(transactions_data.total_despesas or 0),
                    'lucro_liquido': float((transactions_data.total_receitas or 0) - (transactions_data.total_despesas or 0)),
                    'primeira_transacao': transactions_data.primeira_transacao.isoformat() if transactions_data.primeira_transacao else None,
                    'ultima_transacao': transactions_data.ultima_transacao.isoformat() if transactions_data.ultima_transacao else None
                }
            
            # Metas
            goals_data = self.db.execute(text("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'ativa' THEN 1 END) as ativas,
                    COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
                    AVG(valor_atual / valor_meta * 100) as progresso_medio,
                    SUM(valor_meta) as valor_total_metas,
                    SUM(valor_atual) as valor_atual_total
                FROM metas 
                WHERE id_usuario = :user_id
            """), {'user_id': user_id}).fetchone()
            
            if goals_data:
                stats['goals'] = {
                    'total': goals_data.total,
                    'ativas': goals_data.ativas,
                    'concluidas': goals_data.concluidas,
                    'progresso_medio': float(goals_data.progresso_medio or 0),
                    'valor_total_metas': float(goals_data.valor_total_metas or 0),
                    'valor_atual_total': float(goals_data.valor_atual_total or 0)
                }
            
            # Sessões de trabalho
            sessions_data = self.db.execute(text("""
                SELECT 
                    COUNT(*) as total,
                    SUM(horas_trabalhadas) as total_horas,
                    AVG(horas_trabalhadas) as media_horas_sessao,
                    SUM(km_rodados) as total_km,
                    SUM(corridas_realizadas) as total_corridas,
                    MIN(data_inicio) as primeira_sessao,
                    MAX(data_inicio) as ultima_sessao
                FROM sessoes_trabalho 
                WHERE id_usuario = :user_id
            """), {'user_id': user_id}).fetchone()
            
            if sessions_data and sessions_data.total > 0:
                stats['sessions'] = {
                    'total': sessions_data.total,
                    'total_horas': float(sessions_data.total_horas or 0),
                    'media_horas_sessao': float(sessions_data.media_horas_sessao or 0),
                    'total_km': float(sessions_data.total_km or 0),
                    'total_corridas': sessions_data.total_corridas or 0,
                    'primeira_sessao': sessions_data.primeira_sessao.isoformat() if sessions_data.primeira_sessao else None,
                    'ultima_sessao': sessions_data.ultima_sessao.isoformat() if sessions_data.ultima_sessao else None
                }
            else:
                stats['sessions'] = {
                    'total': 0,
                    'message': 'Nenhuma sessão de trabalho encontrada'
                }
            
            # Métricas calculadas
            if 'transactions' in stats and 'sessions' in stats:
                total_receitas = stats['transactions']['total_receitas']
                total_horas = stats['sessions']['total_horas']
                
                if total_horas > 0:
                    stats['metrics'] = {
                        'receita_por_hora': total_receitas / total_horas,
                        'corridas_por_hora': stats['sessions']['total_corridas'] / total_horas if total_horas > 0 else 0,
                        'km_por_hora': stats['sessions']['total_km'] / total_horas if total_horas > 0 else 0
                    }
            
            # Timestamp da consulta
            stats['generated_at'] = datetime.now().isoformat()
            
        except Exception as e:
            logger.error(f"Erro coletando estatísticas: {e}")
            stats['error'] = str(e)
        
        return stats
    
    def reset_demo_data(self) -> bool:
        """
        Remove todos os dados do usuário demo
        
        Returns:
            True se reset foi bem-sucedido
        """
        try:
            user = self.get_demo_user()
            if not user:
                logger.warning("Usuário demo não encontrado para reset")
                return True  # Não é erro se não existe
            
            user_id = user.id
            
            # Deletar em ordem (respeitando foreign keys)
            logger.info("Removendo sessões de trabalho...")
            self.db.query(SessaoTrabalho).filter(
                SessaoTrabalho.id_usuario == user_id
            ).delete()
            
            logger.info("Removendo transações...")
            self.db.query(Transacao).filter(
                Transacao.id_usuario == user_id
            ).delete()
            
            logger.info("Removendo metas...")
            self.db.query(Meta).filter(
                Meta.id_usuario == user_id
            ).delete()
            
            logger.info("Removendo categorias...")
            self.db.query(Categoria).filter(
                Categoria.id_usuario == user_id
            ).delete()
            
            logger.info("Removendo usuário...")
            self.db.query(Usuario).filter(
                Usuario.id == user_id
            ).delete()
            
            self.db.commit()
            logger.info("✅ Reset completo realizado")
            return True
            
        except Exception as e:
            logger.error(f"Erro no reset: {e}")
            self.db.rollback()
            return False
    
    def demo_login_shortcut(self) -> Dict:
        """
        Retorna dados para login automático em desenvolvimento
        
        Returns:
            Dict com token e dados do usuário (simulado)
        """
        user = self.get_demo_user()
        if not user:
            raise NotFoundError("Usuário demo não encontrado")
        
        # Simular resposta de login bem-sucedido
        return {
            'access_token': 'demo_token_' + str(user.id),
            'token_type': 'bearer',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'nome_completo': user.nome_completo,
                'nome_usuario': user.nome_usuario,
                'tipo_assinatura': user.tipo_assinatura,
                'eh_pago': user.eh_pago
            },
            'expires_in': 3600,
            'demo_mode': True
        }
    
    def get_demo_health_check(self) -> Dict:
        """
        Verifica saúde do ambiente demo
        
        Returns:
            Dict com status de saúde
        """
        health = {
            'status': 'unknown',
            'timestamp': datetime.now().isoformat(),
            'checks': {}
        }
        
        try:
            # Verificar usuário
            user = self.get_demo_user()
            health['checks']['user'] = {
                'status': 'ok' if user else 'error',
                'exists': user is not None
            }
            
            if user:
                user_id = user.id
                
                # Verificar dados básicos
                checks = [
                    ('categories', Categoria, 5),
                    ('transactions', Transacao, 100),
                    ('goals', Meta, 3)
                ]
                
                all_ok = True
                for check_name, model, min_count in checks:
                    count = self.db.query(model).filter(
                        model.id_usuario == user_id
                    ).count()
                    
                    is_ok = count >= min_count
                    health['checks'][check_name] = {
                        'status': 'ok' if is_ok else 'warning',
                        'count': count,
                        'minimum': min_count
                    }
                    
                    if not is_ok:
                        all_ok = False
                
                # Status geral
                health['status'] = 'healthy' if all_ok else 'degraded'
            else:
                health['status'] = 'error'
                health['message'] = 'Usuário demo não encontrado'
            
        except Exception as e:
            health['status'] = 'error'
            health['error'] = str(e)
        
        return health


# Funções auxiliares standalone

def get_demo_user_credentials() -> Dict[str, str]:
    """Função standalone para obter credenciais demo"""
    with DemoHelpers() as helper:
        return helper.get_demo_user_credentials()


def validate_demo_data() -> Dict[str, bool]:
    """Função standalone para validar dados demo"""
    with DemoHelpers() as helper:
        return helper.validate_demo_data()


def reset_demo_data() -> bool:
    """Função standalone para resetar dados demo"""
    with DemoHelpers() as helper:
        return helper.reset_demo_data()


def demo_login_shortcut() -> Dict:
    """Função standalone para login automático"""
    with DemoHelpers() as helper:
        return helper.demo_login_shortcut()


def get_demo_statistics() -> Dict:
    """Função standalone para obter estatísticas"""
    with DemoHelpers() as helper:
        return helper.get_demo_statistics()


def get_demo_health_check() -> Dict:
    """Função standalone para verificar saúde"""
    with DemoHelpers() as helper:
        return helper.get_demo_health_check()


# Decorator para funções que precisam do usuário demo
def require_demo_user(func):
    """Decorator que garante que o usuário demo existe"""
    def wrapper(*args, **kwargs):
        with DemoHelpers() as helper:
            user = helper.get_demo_user()
            if not user:
                raise NotFoundError("Usuário demo não encontrado. Execute o script de seed primeiro.")
            return func(*args, **kwargs)
    return wrapper
