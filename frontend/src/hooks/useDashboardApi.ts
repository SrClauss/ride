import { useState, useEffect } from 'react'
import { dashboardService } from '../services/dataService'

export interface DashboardData {
  ganhos_hoje: number
  gastos_hoje: number
  lucro_hoje: number
  corridas_hoje: number
  horas_hoje: number
  eficiencia: number
  
  ganhos_semana: number
  gastos_semana: number
  lucro_semana: number
  corridas_semana: number
  horas_semana: number
  
  meta_diaria: number | null
  meta_semanal: number | null
  
  tendencia_ganhos: number
  tendencia_gastos: number
  tendencia_corridas: number
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Hook: Fetching dashboard data...')
      const dashboardData = await dashboardService.getDashboardData()
      setData(dashboardData)
      console.log('✅ Hook: Dashboard data loaded successfully')
    } catch (err) {
      console.error('❌ Hook: Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch }
}
