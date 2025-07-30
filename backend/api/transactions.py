"""
Rotas de transações
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.transaction_schemas import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    TransactionFilters, TransactionSummary, TransactionByCategory, DailyTransaction
)
from services.transaction_service import TransactionService
from api.dependencies import get_current_active_user
from utils.helpers import ResponseFormatter
from utils.exceptions import RiderFinanceException
from config.logging_config import logger

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/", response_model=dict)
def get_transactions(
    page: int = Query(1, ge=1, description="Página"),
    per_page: int = Query(50, ge=1, le=100, description="Itens por página"),
    tipo: Optional[str] = Query(None, description="Tipo: receita ou despesa"),
    categoria_id: Optional[str] = Query(None, description="ID da categoria"),
    data_inicio: Optional[datetime] = Query(None, description="Data inicial"),
    data_fim: Optional[datetime] = Query(None, description="Data final"),
    busca: Optional[str] = Query(None, description="Termo de busca"),
    ordenar_por: str = Query("data", description="Campo para ordenação"),
    ordem: str = Query("desc", description="Ordem: asc ou desc"),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista transações do usuário"""
    try:
        transactions, total = TransactionService.get_user_transactions(
            db=db,
            user_id=current_user.id,
            page=page,
            per_page=per_page,
            tipo=tipo,
            categoria_id=categoria_id,
            data_inicio=data_inicio,
            data_fim=data_fim,
            busca=busca,
            ordenar_por=ordenar_por,
            ordem=ordem
        )
        
        return ResponseFormatter.paginated(
            data=[trans.para_dict() for trans in transactions],
            total=total,
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter transações: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.post("/", response_model=dict)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria nova transação"""
    try:
        transaction = TransactionService.create_transaction(
            db=db,
            user_id=current_user.id,
            id_categoria=transaction_data.id_categoria,
            valor=transaction_data.valor,
            tipo=transaction_data.tipo,
            descricao=transaction_data.descricao,
            data=transaction_data.data,
            origem=transaction_data.origem,
            id_externo=transaction_data.id_externo,
            plataforma=transaction_data.plataforma,
            observacoes=transaction_data.observacoes,
            tags=transaction_data.tags
        )
        
        return ResponseFormatter.success(
            data=transaction.para_dict(),
            message="Transação criada com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao criar transação: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/{transaction_id}", response_model=dict)
def get_transaction(
    transaction_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém transação por ID"""
    try:
        transaction = TransactionService.get_transaction_by_id(db, transaction_id, current_user.id)
        
        return ResponseFormatter.success(
            data=transaction.para_dict(),
            message="Transação obtida com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao obter transação: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.put("/{transaction_id}", response_model=dict)
def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza transação"""
    try:
        transaction = TransactionService.update_transaction(
            db=db,
            transaction_id=transaction_id,
            user_id=current_user.id,
            id_categoria=transaction_data.id_categoria,
            valor=transaction_data.valor,
            descricao=transaction_data.descricao,
            data=transaction_data.data,
            observacoes=transaction_data.observacoes,
            tags=transaction_data.tags
        )
        
        return ResponseFormatter.success(
            data=transaction.para_dict(),
            message="Transação atualizada com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao atualizar transação: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.delete("/{transaction_id}", response_model=dict)
def delete_transaction(
    transaction_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove transação"""
    try:
        TransactionService.delete_transaction(db, transaction_id, current_user.id)
        
        return ResponseFormatter.success(
            message="Transação removida com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao remover transação: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/summary/overview", response_model=dict)
def get_transactions_summary(
    data_inicio: Optional[datetime] = Query(None, description="Data inicial"),
    data_fim: Optional[datetime] = Query(None, description="Data final"),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém resumo das transações"""
    try:
        summary = TransactionService.get_transactions_summary(
            db=db,
            user_id=current_user.id,
            data_inicio=data_inicio,
            data_fim=data_fim
        )
        
        return ResponseFormatter.success(
            data=summary,
            message="Resumo obtido com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter resumo: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/summary/by-category", response_model=dict)
def get_transactions_by_category(
    data_inicio: Optional[datetime] = Query(None, description="Data inicial"),
    data_fim: Optional[datetime] = Query(None, description="Data final"),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém transações agrupadas por categoria"""
    try:
        by_category = TransactionService.get_transactions_by_category(
            db=db,
            user_id=current_user.id,
            data_inicio=data_inicio,
            data_fim=data_fim
        )
        
        return ResponseFormatter.success(
            data=by_category,
            message="Dados por categoria obtidos com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter dados por categoria: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/summary/daily", response_model=dict)
def get_daily_transactions(
    data_inicio: Optional[datetime] = Query(None, description="Data inicial"),
    data_fim: Optional[datetime] = Query(None, description="Data final"),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém transações agrupadas por dia"""
    try:
        daily_data = TransactionService.get_daily_transactions(
            db=db,
            user_id=current_user.id,
            data_inicio=data_inicio,
            data_fim=data_fim
        )
        
        return ResponseFormatter.success(
            data=daily_data,
            message="Dados diários obtidos com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter dados diários: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/search/{termo}", response_model=dict)
def search_transactions(
    termo: str,
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Busca transações por termo"""
    try:
        transactions = TransactionService.search_transactions(
            db=db,
            user_id=current_user.id,
            termo=termo,
            limit=limit
        )
        
        return ResponseFormatter.success(
            data=[trans.para_dict() for trans in transactions],
            message="Busca realizada com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro na busca de transações: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")
