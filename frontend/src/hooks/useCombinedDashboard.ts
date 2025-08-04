import { useState, useEffect } from 'react'
import { dashboardService, transactionService, categoryService } from '../services/dataService'
import { DashboardData } from './useDashboardApi'
import { Transaction, Category } from '../types'
import { TransactionSummary } from './useTransactionSummary'

export interface CombinedDashboardData {
  dashboardData: DashboardData
  recentTransactions: Transaction[]
  categories: Category[]
  summary: TransactionSummary
}

export const useCombinedDashboardData = () => {
  const [data, setData] = useState<CombinedDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Hook: Fetching combined dashboard data...')
      
      // Buscar todos os dados em paralelo
      const [dashboardData, recentTransactions, categories, summary] = await Promise.all([
        dashboardService.getDashboardData(),
        transactionService.getRecentTransactions(5),
        categoryService.getCategories(),
        transactionService.getTransactionSummary()
      ])
      
      setData({
        dashboardData,
        recentTransactions,
        categories,
        summary
      })
      
      console.log('✅ Hook: Combined dashboard data loaded successfully')
    } catch (err) {
      console.error('❌ Hook: Error loading combined dashboard data:', err)
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
