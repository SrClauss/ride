import { useState, useEffect } from 'react'
import { dashboardDataService } from '../services/dataService'

export interface Transaction {
  id: string
  id_usuario: string
  id_categoria: string
  valor: number
  descricao: string
  tipo: 'receita' | 'despesa'
  data: string
  origem?: string
  plataforma?: string
  observacoes?: string
  tags?: string
  criado_em: string
  nome_categoria: string
}

export const useTransactionsData = (page: number = 1, limit: number = 10) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await dashboardDataService.getAllDashboardData()
        // Pega as transações recentes baseado no limit
        const recentTransactions = result.recentTransactions.slice(0, limit)
        setTransactions(recentTransactions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page, limit])

  return { transactions, loading, error }
}
