import { useState, useEffect } from 'react'
import { dashboardDataService } from '../services/dataService'

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
  
  meta_diaria: number
  meta_semanal: number
  
  tendencia_ganhos: number
  tendencia_gastos: number
  tendencia_corridas: number
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await dashboardDataService.getAllDashboardData()
        setData(result.dashboardData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
