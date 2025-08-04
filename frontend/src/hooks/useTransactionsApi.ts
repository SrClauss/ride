import { useState, useEffect } from 'react'
import { transactionService } from '../services/dataService'
import { Transaction } from '../types'

export interface PaginatedTransactions {
  transactions: Transaction[]
  total: number
  currentPage: number
  totalPages: number
}

export const useTransactionsData = (page: number = 1, perPage: number = 10) => {
  const [data, setData] = useState<PaginatedTransactions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔄 Hook: Fetching transactions page ${page}, per page ${perPage}...`)
      
      const result = await transactionService.getTransactions(page, perPage)
      
      setData({
        transactions: result.transactions,
        total: result.total,
        currentPage: page,
        totalPages: Math.ceil(result.total / perPage)
      })
      
      console.log('✅ Hook: Transactions loaded successfully', result.transactions.length, 'items')
    } catch (err) {
      console.error('❌ Hook: Error loading transactions:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, perPage])

  const refetch = () => {
    fetchData()
  }

  return { 
    transactions: data?.transactions || [],
    total: data?.total || 0,
    currentPage: data?.currentPage || 1,
    totalPages: data?.totalPages || 0,
    loading, 
    error, 
    refetch 
  }
}

export const useRecentTransactions = (limit: number = 5) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔄 Hook: Fetching ${limit} recent transactions...`)
      
      const result = await transactionService.getRecentTransactions(limit)
      setTransactions(result)
      
      console.log('✅ Hook: Recent transactions loaded successfully', result.length, 'items')
    } catch (err) {
      console.error('❌ Hook: Error loading recent transactions:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações recentes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [limit])

  const refetch = () => {
    fetchData()
  }

  return { transactions, loading, error, refetch }
}
