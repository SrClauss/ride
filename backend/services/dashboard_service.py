"""
Serviço para cálculos de dashboard
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models import Transacao, SessaoTrabalho, Meta
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

class DashboardService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Calcula todas as estatísticas do dashboard para um usuário"""
        now = datetime.now(timezone.utc)
        hoje_inicio = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Semana atual (segunda a domingo)
        dias_desde_segunda = now.weekday()
        semana_inicio = hoje_inicio - timedelta(days=dias_desde_segunda)
        
        # Semana anterior para tendências
        semana_anterior_inicio = semana_inicio - timedelta(days=7)
        semana_anterior_fim = semana_inicio
        
        # Calcular dados de hoje
        stats_hoje = self._calcular_stats_periodo(user_id, hoje_inicio, now)
        
        # Calcular dados da semana atual
        stats_semana = self._calcular_stats_periodo(user_id, semana_inicio, now)
        
        # Calcular dados da semana anterior para tendências
        stats_semana_anterior = self._calcular_stats_periodo(user_id, semana_anterior_inicio, semana_anterior_fim)
        
        # Buscar metas ativas
        metas = self._buscar_metas_ativas(user_id)
        
        # Calcular eficiência (ganhos por hora)
        eficiencia = stats_hoje["ganhos"] / stats_hoje["horas"] if stats_hoje["horas"] > 0 else 0
        
        # Calcular tendências
        tendencias = self._calcular_tendencias(stats_semana, stats_semana_anterior)
        
        return {
            # Dados de hoje
            "ganhos_hoje": stats_hoje["ganhos"],
            "gastos_hoje": stats_hoje["gastos"],
            "lucro_hoje": stats_hoje["ganhos"] - stats_hoje["gastos"],
            "corridas_hoje": stats_hoje["corridas"],
            "horas_hoje": stats_hoje["horas"],
            "eficiencia": round(eficiencia, 2),
            
            # Dados da semana
            "ganhos_semana": stats_semana["ganhos"],
            "gastos_semana": stats_semana["gastos"], 
            "lucro_semana": stats_semana["ganhos"] - stats_semana["gastos"],
            "corridas_semana": stats_semana["corridas"],
            "horas_semana": stats_semana["horas"],
            
            # Metas
            "meta_diaria": metas.get("diaria"),
            "meta_semanal": metas.get("semanal"),
            
            # Tendências
            "tendencia_ganhos": tendencias["ganhos"],
            "tendencia_gastos": tendencias["gastos"],
            "tendencia_corridas": tendencias["corridas"]
        }
    
    def _calcular_stats_periodo(self, user_id: str, inicio: datetime, fim: datetime) -> Dict[str, float]:
        """Calcula estatísticas para um período específico"""
        
        # Ganhos (receitas)
        ganhos = self.db.query(func.coalesce(func.sum(Transacao.valor), 0)).filter(
            and_(
                Transacao.id_usuario == user_id,
                Transacao.tipo == "receita",
                Transacao.data >= inicio,
                Transacao.data <= fim
            )
        ).scalar()
        
        # Gastos (despesas)
        gastos = self.db.query(func.coalesce(func.sum(Transacao.valor), 0)).filter(
            and_(
                Transacao.id_usuario == user_id,
                Transacao.tipo == "despesa",
                Transacao.data >= inicio,
                Transacao.data <= fim
            )
        ).scalar()
        
        # Contagem de corridas (transações de receita que não são manuais)
        corridas = self.db.query(func.count(Transacao.id)).filter(
            and_(
                Transacao.id_usuario == user_id,
                Transacao.tipo == "receita",
                Transacao.origem != "manual",
                Transacao.data >= inicio,
                Transacao.data <= fim
            )
        ).scalar()
        
        # Horas trabalhadas (soma das sessões do período)
        horas_query = self.db.query(func.coalesce(func.sum(SessaoTrabalho.total_minutos), 0)).filter(
            and_(
                SessaoTrabalho.id_usuario == user_id,
                SessaoTrabalho.inicio >= inicio,
                SessaoTrabalho.inicio <= fim,
                SessaoTrabalho.eh_ativa == False  # Apenas sessões finalizadas
            )
        ).scalar()
        
        horas = (horas_query or 0) / 60.0  # Converter minutos para horas
        
        return {
            "ganhos": float(ganhos or 0),
            "gastos": float(gastos or 0),
            "corridas": int(corridas or 0),
            "horas": round(horas, 2)
        }
    
    def _buscar_metas_ativas(self, user_id: str) -> Dict[str, Optional[float]]:
        """Busca metas ativas do usuário"""
        metas = self.db.query(Meta).filter(
            and_(
                Meta.id_usuario == user_id,
                Meta.eh_ativa == True,
                Meta.eh_concluida == False
            )
        ).all()
        
        resultado = {"diaria": None, "semanal": None}
        
        for meta in metas:
            # Assumindo que existe um campo ou lógica para identificar se é meta diária/semanal
            # Por enquanto, vou usar uma heurística baseada no valor alvo
            if meta.valor_alvo <= 500:  # Heurística: valores menores são metas diárias
                resultado["diaria"] = float(meta.valor_alvo)
            else:  # Valores maiores são metas semanais
                resultado["semanal"] = float(meta.valor_alvo)
        
        return resultado
    
    def _calcular_tendencias(self, stats_atual: Dict, stats_anterior: Dict) -> Dict[str, float]:
        """Calcula tendências comparando período atual com anterior"""
        
        def calcular_percentual_mudanca(atual: float, anterior: float) -> float:
            if anterior == 0:
                return 100.0 if atual > 0 else 0.0
            return round(((atual - anterior) / anterior) * 100, 1)
        
        return {
            "ganhos": calcular_percentual_mudanca(stats_atual["ganhos"], stats_anterior["ganhos"]),
            "gastos": calcular_percentual_mudanca(stats_atual["gastos"], stats_anterior["gastos"]),
            "corridas": calcular_percentual_mudanca(stats_atual["corridas"], stats_anterior["corridas"])
        }
