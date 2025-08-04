"""
Schemas Pydantic para dashboard
"""
from pydantic import BaseModel
from typing import Optional

class DashboardStats(BaseModel):
    """Schema para estatísticas do dashboard"""
    # Dados de hoje
    ganhos_hoje: float
    gastos_hoje: float
    lucro_hoje: float
    corridas_hoje: int
    horas_hoje: float
    eficiencia: float
    
    # Dados da semana
    ganhos_semana: float
    gastos_semana: float
    lucro_semana: float
    corridas_semana: int
    horas_semana: float
    
    # Metas
    meta_diaria: Optional[float] = None
    meta_semanal: Optional[float] = None
    
    # Tendências (percentual de mudança)
    tendencia_ganhos: float
    tendencia_gastos: float
    tendencia_corridas: float
