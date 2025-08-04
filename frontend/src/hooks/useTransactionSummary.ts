import { useState, useEffect } from 'react'
import { transactionService } from '../services/dataService'

export interface TransactionSummary {
  total_receitas: number
  total_despesas: number
  saldo: number
  mes_atual: {
    receitas: number
    despesas: number
    saldo: number
  }
}

export const useTransactionSummary = () => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Hook: Fetching transaction summary...')
      
      const result = await transactionService.getTransactionSummary()
      setSummary(result)
      
      console.log('✅ Hook: Transaction summary loaded successfully')
    } catch (err) {
      console.error('❌ Hook: Error loading transaction summary:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar resumo de transações')
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

  return { summary, loading, error, refetch }
}
