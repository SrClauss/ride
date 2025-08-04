#!/usr/bin/env python3
"""
API Demo - Endpoints Auxiliares para Desenvolvimento
====================================================

Este módulo fornece endpoints específicos para facilitar o desenvolvimento
e testes do ambiente de demonstração.

Endpoints:
- GET /demo/login        # Credenciais do usuário demo
- GET /demo/stats        # Estatísticas dos dados demo
- POST /demo/reset       # Recriar dados demo
- GET /demo/health       # Verificar consistência dos dados

⚠️ IMPORTANTE: Estes endpoints são apenas para desenvolvimento!
⚠️ NÃO devem estar disponíveis em produção!
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging
import subprocess
import sys
import os

from config.database import get_db
from utils.demo_helpers import (
    DemoHelpers, 
    get_demo_user_credentials,
    validate_demo_data,
    get_demo_statistics,
    get_demo_health_check,
    reset_demo_data
)
from utils.exceptions import NotFoundError

logger = logging.getLogger(__name__)

# Router para endpoints demo
router = APIRouter(prefix="/demo", tags=["Demo"])


@router.get("/login", summary="Obter credenciais do usuário demo")
def get_demo_login_credentials() -> Dict[str, Any]:
    """
    Retorna as credenciais do usuário demo para facilitar testes
    
    Returns:
        Dict com email, senha e outros dados do usuário demo
    """
    try:
        credentials = get_demo_user_credentials()
        
        return {
            "success": True,
            "message": "Credenciais do usuário demo",
            "data": {
                "email": credentials["email"],
                "password": credentials["password"],
                "username": credentials["username"],
                "full_name": credentials["full_name"],
                "subscription_type": credentials["subscription_type"]
            },
            "instructions": {
                "login_endpoint": "POST /auth/login",
                "payload_example": {
                    "email": credentials["email"],
                    "senha": credentials["password"]
                }
            }
        }
    except Exception as e:
        logger.error(f"Erro obtendo credenciais demo: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/stats", summary="Estatísticas dos dados demo")
def get_demo_stats() -> Dict[str, Any]:
    """
    Retorna estatísticas detalhadas dos dados demo
    
    Returns:
        Dict com estatísticas completas do usuário demo
    """
    try:
        stats = get_demo_statistics()
        
        if 'error' in stats:
            raise HTTPException(
                status_code=404,
                detail=f"Erro nos dados demo: {stats['error']}"
            )
        
        return {
            "success": True,
            "message": "Estatísticas dos dados demo",
            "data": stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro obtendo estatísticas: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/health", summary="Verificar consistência dos dados demo")
def check_demo_health() -> Dict[str, Any]:
    """
    Verifica a saúde e consistência dos dados demo
    
    Returns:
        Dict com status de saúde e verificações
    """
    try:
        health = get_demo_health_check()
        
        # Determinar código de status baseado na saúde
        if health['status'] == 'healthy':
            status_code = 200
        elif health['status'] == 'degraded':
            status_code = 200  # Ainda funcionando, mas com avisos
        else:
            status_code = 503  # Service unavailable
        
        return {
            "success": health['status'] != 'error',
            "message": f"Status: {health['status']}",
            "data": health
        }
        
    except Exception as e:
        logger.error(f"Erro verificando saúde: {e}")
        return {
            "success": False,
            "message": f"Erro na verificação: {str(e)}",
            "data": {
                "status": "error",
                "error": str(e)
            }
        }


@router.post("/reset", summary="Recriar dados demo")
def reset_demo_data_endpoint(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Remove todos os dados demo e executa o script de seed para recriar
    
    Returns:
        Dict com status da operação
    """
    try:
        # Primeiro, validar se dados existem
        validations = validate_demo_data()
        
        if not validations.get('user_exists', False):
            return {
                "success": True,
                "message": "Dados demo não existem, nada para resetar",
                "data": {
                    "action": "no_action_needed",
                    "validations": validations
                }
            }
        
        # Executar reset em background para não travar a resposta
        background_tasks.add_task(execute_demo_reset)
        
        return {
            "success": True,
            "message": "Reset iniciado em background",
            "data": {
                "action": "reset_started",
                "estimated_time": "30-60 segundos",
                "check_status": "GET /demo/health"
            }
        }
        
    except Exception as e:
        logger.error(f"Erro iniciando reset: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


def execute_demo_reset():
    """Função para executar reset em background"""
    try:
        logger.info("Iniciando reset dos dados demo...")
        
        # Executar script de seed
        script_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "scripts",
            "seed_demo_data.py"
        )
        
        if os.path.exists(script_path):
            result = subprocess.run(
                [sys.executable, script_path],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos timeout
            )
            
            if result.returncode == 0:
                logger.info("✅ Reset dos dados demo concluído com sucesso")
            else:
                logger.error(f"❌ Erro no reset: {result.stderr}")
        else:
            logger.error(f"Script de seed não encontrado: {script_path}")
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Timeout no reset dos dados demo")
    except Exception as e:
        logger.error(f"❌ Erro executando reset: {e}")


@router.get("/validate", summary="Validar integridade dos dados demo")
def validate_demo_data_endpoint() -> Dict[str, Any]:
    """
    Valida a integridade dos dados demo
    
    Returns:
        Dict com resultado das validações
    """
    try:
        validations = validate_demo_data()
        
        return {
            "success": validations.get('all_valid', False),
            "message": "Validação dos dados demo",
            "data": {
                "validations": validations,
                "summary": {
                    "user_exists": validations.get('user_exists', False),
                    "categories_count": validations.get('categories_count', 0),
                    "transactions_count": validations.get('transactions_count', 0),
                    "goals_count": validations.get('goals_count', 0),
                    "sessions_count": validations.get('sessions_count', 0),
                    "all_valid": validations.get('all_valid', False)
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Erro na validação: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/quick-start", summary="Guia de início rápido")
def get_quick_start_guide() -> Dict[str, Any]:
    """
    Retorna um guia de início rápido para usar o ambiente demo
    
    Returns:
        Dict com instruções e exemplos
    """
    credentials = get_demo_user_credentials()
    
    return {
        "success": True,
        "message": "Guia de início rápido para ambiente demo",
        "data": {
            "step_1": {
                "title": "1. Fazer Login",
                "endpoint": "POST /auth/login",
                "payload": {
                    "email": credentials["email"],
                    "senha": credentials["password"]
                },
                "expected_response": {
                    "access_token": "string",
                    "token_type": "bearer",
                    "user": {
                        "id": "string",
                        "email": credentials["email"],
                        "nome_completo": credentials["full_name"]
                    }
                }
            },
            "step_2": {
                "title": "2. Verificar Perfil",
                "endpoint": "GET /auth/me",
                "headers": {
                    "Authorization": "Bearer {access_token}"
                },
                "description": "Use o token obtido no login"
            },
            "step_3": {
                "title": "3. Explorar Dashboard",
                "endpoint": "GET /dashboard/stats",
                "description": "Estatísticas gerais do usuário"
            },
            "step_4": {
                "title": "4. Listar Transações",
                "endpoint": "GET /transactions",
                "parameters": {
                    "page": 1,
                    "per_page": 10,
                    "start_date": "2023-01-01",
                    "end_date": "2025-12-31"
                }
            },
            "step_5": {
                "title": "5. Visualizar Metas",
                "endpoint": "GET /goals",
                "description": "Metas ativas e concluídas do usuário"
            },
            "useful_endpoints": {
                "categories": "GET /categories",
                "transaction_summary": "GET /transactions/summary/overview",
                "goals_by_category": "GET /goals?categoria=emergency"
            },
            "demo_endpoints": {
                "health_check": "GET /demo/health",
                "statistics": "GET /demo/stats",
                "reset_data": "POST /demo/reset"
            }
        }
    }


@router.get("/", summary="Informações dos endpoints demo")
def get_demo_info() -> Dict[str, Any]:
    """
    Retorna informações sobre os endpoints demo disponíveis
    
    Returns:
        Dict com lista de endpoints e suas funções
    """
    return {
        "success": True,
        "message": "Endpoints Demo para Desenvolvimento",
        "data": {
            "description": "Endpoints auxiliares para facilitar desenvolvimento e testes",
            "warning": "⚠️ Apenas para desenvolvimento! Não usar em produção!",
            "endpoints": {
                "GET /demo/": "Esta página - informações gerais",
                "GET /demo/login": "Credenciais do usuário demo",
                "GET /demo/stats": "Estatísticas detalhadas dos dados",
                "GET /demo/health": "Verificar saúde dos dados",
                "GET /demo/validate": "Validar integridade dos dados",
                "POST /demo/reset": "Reset completo dos dados (background)",
                "GET /demo/quick-start": "Guia de início rápido"
            },
            "user_credentials": {
                "email": "demo@riderfinance.com",
                "password": "demo123"
            },
            "setup_commands": {
                "initial_setup": "python scripts/setup_demo.py",
                "quick_reset": "python scripts/setup_demo.py --reset",
                "seed_only": "python scripts/seed_demo_data.py"
            }
        }
    }
