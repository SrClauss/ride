"""
API endpoints para metas/goals
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from config.database import get_db
from api.dependencies import get_current_user
from schemas.goal_schemas import (
    MetaCreate, MetaUpdate, MetaProgressUpdate, MetaResponse,
    TipoMeta, CategoriaMeta
)
from services.goal_service import GoalService
from utils.helpers import ResponseFormatter
from utils.exceptions import NotFoundError, ValidationError
from config.logging_config import logger

router = APIRouter(prefix="/goals", tags=["Metas"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
async def create_goal(
    goal_data: MetaCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar uma nova meta"""
    try:
        logger.info(f"Criando meta para usuário {current_user.id}")
        
        meta = GoalService.create_goal(
            db=db,
            user_id=current_user.id,
            goal_data=goal_data
        )
        
        return ResponseFormatter.success(
            data=meta,
            message="Meta criada com sucesso"
        )
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao criar meta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/", response_model=Dict[str, Any])
async def get_user_goals(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    active_only: bool = Query(True, description="Retornar apenas metas ativas"),
    tipo: Optional[TipoMeta] = Query(None, description="Filtrar por tipo de meta"),
    categoria: Optional[CategoriaMeta] = Query(None, description="Filtrar por categoria"),
    limit: int = Query(50, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação")
):
    """Listar metas do usuário"""
    try:
        metas = GoalService.get_user_goals(
            db=db,
            user_id=current_user.id,
            active_only=active_only,
            tipo=tipo.value if tipo else None,
            categoria=categoria.value if categoria else None,
            limit=limit,
            offset=offset
        )
        
        return ResponseFormatter.success(
            data=metas,
            message="Metas recuperadas com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro ao buscar metas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/{goal_id}", response_model=Dict[str, Any])
async def get_goal(
    goal_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter uma meta específica"""
    try:
        meta = GoalService.get_goal_by_id(
            db=db,
            goal_id=goal_id,
            user_id=current_user.id
        )
        
        return ResponseFormatter.success(
            data=meta,
            message="Meta recuperada com sucesso"
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    except Exception as e:
        logger.error(f"Erro ao buscar meta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.patch("/{goal_id}/progress", response_model=Dict[str, Any])
async def update_goal_progress(
    goal_id: str,
    progress_data: MetaProgressUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar progresso de uma meta"""
    try:
        meta = GoalService.update_goal_progress(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id,
            progress_data=progress_data
        )
        
        return ResponseFormatter.success(
            data=meta,
            message="Progresso da meta atualizado com sucesso"
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao atualizar progresso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.put("/{goal_id}", response_model=Dict[str, Any])
async def update_goal(
    goal_id: str,
    goal_data: MetaUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar uma meta"""
    try:
        meta = GoalService.update_goal(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id,
            goal_data=goal_data
        )
        
        return ResponseFormatter.success(
            data=meta,
            message="Meta atualizada com sucesso"
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao atualizar meta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar uma meta"""
    try:
        GoalService.delete_goal(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id
        )
        
        return None
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    except Exception as e:
        logger.error(f"Erro ao deletar meta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.patch("/{goal_id}/deactivate", response_model=Dict[str, Any])
async def deactivate_goal(
    goal_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desativar uma meta"""
    try:
        meta = GoalService.deactivate_goal(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id
        )
        
        return ResponseFormatter.success(
            data=meta,
            message="Meta desativada com sucesso"
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    except Exception as e:
        logger.error(f"Erro ao desativar meta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.patch("/{goal_id}/reactivate", response_model=Dict[str, Any])
async def reactivate_goal(
    goal_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reativar uma meta"""
    try:
        meta = GoalService.reactivate_goal(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id
        )
        
        return ResponseFormatter.success(
            data=meta,
            message="Meta reativada com sucesso"
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    except Exception as e:
        logger.error(f"Erro ao reativar meta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
