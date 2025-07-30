import { apiClient } from './api'

export interface DashboardData {
  ganhos_hoje: number
  gastos_hoje: number
  lucro_hoje: number
  corridas_hoje: number
  horas_hoje: number
  ganhos_semana: number
  gastos_semana: number
  lucro_semana: number
  corridas_semana: number
  horas_semana: number
  meta_diaria?: number
  meta_semanal?: number
  progresso_meta_diaria?: number
  progresso_meta_semanal?: number
  eficiencia?: number
  transacoes_recentes: any[]
  categorias_populares: any[]
  tendencias: any
}

export interface AnalyticsData {
  resumo_periodo: {
    total_receitas: number
    total_despesas: number
    lucro_liquido: number
    total_transacoes: number
    receita_media_por_dia: number
    despesa_media_por_dia: number
  }
  por_categoria: any[]
  por_dia: any[]
  por_mes: any[]
  tendencias: any
  metas: any
}

export const dashboardService = {
  // Dados do dashboard principal
  getDashboardData: async (
    data_inicio?: string,
    data_fim?: string
  ) => {
    const params = {
      ...(data_inicio && { data_inicio }),
      ...(data_fim && { data_fim })
    }
    
    return apiClient.get<DashboardData>('/dashboard', params)
  },

  // Dados analíticos completos
  getAnalyticsData: async (
    periodo: 'hoje' | 'semana' | 'mes' | 'ano' = 'mes',
    data_inicio?: string,
    data_fim?: string
  ) => {
    const params = {
      periodo,
      ...(data_inicio && { data_inicio }),
      ...(data_fim && { data_fim })
    }
    
    return apiClient.get<AnalyticsData>('/analytics', params)
  },

  // Resumo rápido para widgets
  getQuickSummary: async () => {
    return apiClient.get('/dashboard/summary')
  }
}
