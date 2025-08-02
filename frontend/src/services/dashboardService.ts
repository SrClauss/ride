import { apiClient } from './api'

// Interfaces para tipagem adequada
export interface RecentTransaction {
  id: number
  descricao: string
  valor: number
  tipo: 'receita' | 'despesa'
  data: string
  categoria: string
}

export interface PopularCategory {
  categoria: string
  total: number
  count: number
  tipo: 'receita' | 'despesa'
}

export interface TrendData {
  periodo: string
  receitas: number
  despesas: number
  lucro: number
}

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
  transacoes_recentes: RecentTransaction[]
  categorias_populares: PopularCategory[]
  tendencias: TrendData[]
}

export interface CategoryData {
  categoria: string
  total_receitas: number
  total_despesas: number
  lucro: number
  count_receitas: number
  count_despesas: number
}

export interface DailyData {
  data: string
  receitas: number
  despesas: number
  lucro: number
  count_transacoes: number
}

export interface MonthlyData {
  mes: string
  ano: number
  receitas: number
  despesas: number
  lucro: number
  count_transacoes: number
}

export interface GoalData {
  id: number
  titulo: string
  valor_alvo: number
  valor_atual: number
  progresso: number
  status: string
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
  por_categoria: CategoryData[]
  por_dia: DailyData[]
  por_mes: MonthlyData[]
  tendencias: TrendData[]
  metas: GoalData[]
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
