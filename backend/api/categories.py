"""
Rotas de categorias
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.category_schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryUsageStats
from services.category_service import CategoryService
from api.dependencies import get_current_active_user
from utils.helpers import ResponseFormatter
from utils.exceptions import RiderFinanceException
from config.logging_config import logger

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=dict)
def get_categories(
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: receita ou despesa"),
    apenas_ativas: bool = Query(True, description="Apenas categorias ativas"),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista categorias do usuário"""
    try:
        categories = CategoryService.get_user_categories(
            db=db,
            user_id=current_user.id,
            tipo=tipo,
            apenas_ativas=apenas_ativas
        )
        
        return ResponseFormatter.success(
            data=[cat.para_dict() for cat in categories],
            message="Categorias obtidas com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter categorias: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.post("/", response_model=dict)
def create_category(
    category_data: CategoryCreate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria nova categoria"""
    try:
        category = CategoryService.create_category(
            db=db,
            user_id=current_user.id,
            nome=category_data.nome,
            tipo=category_data.tipo,
            icone=category_data.icone,
            cor=category_data.cor
        )
        
        return ResponseFormatter.success(
            data=category.para_dict(),
            message="Categoria criada com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao criar categoria: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/{category_id}", response_model=dict)
def get_category(
    category_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém categoria por ID"""
    try:
        category = CategoryService.get_category_by_id(db, category_id, current_user.id)
        
        return ResponseFormatter.success(
            data=category.para_dict(),
            message="Categoria obtida com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao obter categoria: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.put("/{category_id}", response_model=dict)
def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza categoria"""
    try:
        category = CategoryService.update_category(
            db=db,
            category_id=category_id,
            user_id=current_user.id,
            nome=category_data.nome,
            icone=category_data.icone,
            cor=category_data.cor
        )
        
        return ResponseFormatter.success(
            data=category.para_dict(),
            message="Categoria atualizada com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao atualizar categoria: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.delete("/{category_id}", response_model=dict)
def delete_category(
    category_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove categoria"""
    try:
        CategoryService.delete_category(db, category_id, current_user.id)
        
        return ResponseFormatter.success(
            message="Categoria removida com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao remover categoria: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/tipo/{tipo}", response_model=dict)
def get_categories_by_type(
    tipo: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista categorias por tipo"""
    try:
        if tipo not in ['receita', 'despesa']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipo deve ser 'receita' ou 'despesa'")
        
        categories = CategoryService.get_categories_by_type(db, current_user.id, tipo)
        
        return ResponseFormatter.success(
            data=[cat.para_dict() for cat in categories],
            message=f"Categorias de {tipo} obtidas com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter categorias por tipo: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/search/{termo}", response_model=dict)
def search_categories(
    termo: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Busca categorias por termo"""
    try:
        categories = CategoryService.search_categories(db, current_user.id, termo)
        
        return ResponseFormatter.success(
            data=[cat.para_dict() for cat in categories],
            message="Busca realizada com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro na busca de categorias: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/{category_id}/stats", response_model=dict)
def get_category_stats(
    category_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de uso da categoria"""
    try:
        stats = CategoryService.get_category_usage_stats(db, category_id, current_user.id)
        
        return ResponseFormatter.success(
            data=stats,
            message="Estatísticas obtidas com sucesso"
        )
        
    except RiderFinanceException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas da categoria: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")
