import { apiClient } from './api'
import { Transaction, TransactionForm } from '../types'

export interface TransactionResponse {
  data: Transaction[]
  total: number
  page: number
  per_page: number
}

export interface TransactionFilters {
  tipo?: 'receita' | 'despesa'
  categoria_id?: string
  data_inicio?: string
  data_fim?: string
  busca?: string
  ordenar_por?: string
  ordem?: 'asc' | 'desc'
}

export const transactionService = {
  // Buscar transações com paginação e filtros
  getTransactions: async (
    page: number = 1,
    per_page: number = 50,
    filters?: TransactionFilters
  ) => {
    const params = {
      page,
      per_page,
      ...filters
    }
    
    return apiClient.get<TransactionResponse>('/transactions', params)
  },

  // Buscar transação por ID
  getTransaction: async (id: string) => {
    return apiClient.get<Transaction>(`/transactions/${id}`)
  },

  // Criar nova transação
  createTransaction: async (data: TransactionForm) => {
    return apiClient.post<Transaction>('/transactions', data)
  },

  // Atualizar transação
  updateTransaction: async (id: string, data: Partial<TransactionForm>) => {
    return apiClient.put<Transaction>(`/transactions/${id}`, data)
  },

  // Deletar transação
  deleteTransaction: async (id: string) => {
    return apiClient.delete(`/transactions/${id}`)
  },

  // Resumo das transações
  getTransactionSummary: async (
    data_inicio?: string,
    data_fim?: string
  ) => {
    const params = {
      ...(data_inicio && { data_inicio }),
      ...(data_fim && { data_fim })
    }
    
    return apiClient.get('/transactions/summary/overview', params)
  },

  // Transações por categoria
  getTransactionsByCategory: async (
    data_inicio?: string,
    data_fim?: string
  ) => {
    const params = {
      ...(data_inicio && { data_inicio }),
      ...(data_fim && { data_fim })
    }
    
    return apiClient.get('/transactions/summary/by-category', params)
  },

  // Transações diárias
  getDailyTransactions: async (
    data_inicio?: string,
    data_fim?: string
  ) => {
    const params = {
      ...(data_inicio && { data_inicio }),
      ...(data_fim && { data_fim })
    }
    
    return apiClient.get('/transactions/summary/daily', params)
  },

  // Buscar transações
  searchTransactions: async (termo: string) => {
    return apiClient.get(`/transactions/search/${termo}`)
  }
}
