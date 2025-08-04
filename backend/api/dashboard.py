"""
API endpoints para dashboard
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.dependencies import get_current_user, get_db
from services.dashboard_service import DashboardService
from schemas.dashboard_schemas import DashboardStats
from models import Usuario

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas do dashboard para o usuário logado
    
    Inclui:
    - Dados de hoje e da semana (ganhos, gastos, lucro, corridas, horas)
    - Metas ativas
    - Tendências comparadas com a semana anterior
    - Eficiência (ganhos por hora)
    """
    try:
        dashboard_service = DashboardService(db)
        stats = dashboard_service.get_dashboard_stats(current_user.id)
        return DashboardStats(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao calcular estatísticas do dashboard: {str(e)}"
        )
