/**
 * Data Service - Usa SOMENTE a API real do backend
 */
import { api } from './api'
import { Transaction, Category } from '../types'

console.log('🔧 Data Service: Using REAL API data ONLY')

// Interface para dados de criação de transação
interface CreateTransactionData {
  tipo: 'receita' | 'despesa'
  valor: number
  descricao: string
  categoria: string
  data: string
  id_categoria?: number
  plataforma?: string
}

// Interface para dados de criação de categoria  
interface CreateCategoryData {
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
  icone?: string
}

// Interface para dados do dashboard
interface DashboardData {
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

// Interface para resumo de transações
interface TransactionSummary {
  total_receitas: number
  total_despesas: number
  saldo: number
  mes_atual: {
    receitas: number
    despesas: number
    saldo: number
  }
}

/**
 * Dashboard Service
 */
export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    console.log('🌐 Using REAL API dashboard data')
    const response = await api.get('/dashboard/stats')
    return response.data
  }
}

/**
 * Transaction Service  
 */
export const transactionService = {
  async getTransactions(page: number = 1, perPage: number = 50): Promise<{
    transactions: Transaction[]
    total: number
  }> {
    console.log('🌐 Using REAL API transactions data')
    const response = await api.get('/transactions', {
      params: { page, per_page: perPage }
    })
    
    return {
      transactions: response.data.data || [],
      total: response.data.pagination?.total || 0
    }
  },

  async getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
    console.log('🌐 Using REAL API recent transactions')
    const response = await api.get('/transactions', {
      params: { page: 1, per_page: limit, ordenar_por: 'data', ordem: 'desc' }
    })
    
    return response.data.data || []
  },

  async getTransactionSummary(): Promise<TransactionSummary> {
    console.log('🌐 Using REAL API transaction summary')
    const response = await api.get('/transactions/summary/overview')
    return response.data
  },

  async createTransaction(transactionData: CreateTransactionData): Promise<Transaction> {
    console.log('🌐 REAL API: Creating transaction')
    const response = await api.post('/transactions', transactionData)
    return response.data.data
  }
}

/**
 * Category Service
 */
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    console.log('🌐 Using REAL API categories data')
    const response = await api.get('/categories')
    return response.data.data || []
  },

  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    console.log('🌐 REAL API: Creating category')
    const response = await api.post('/categories', categoryData)
    return response.data.data
  }
}

/**
 * Combined Dashboard Hook Data
 */
export const dashboardDataService = {
  async getAllDashboardData() {
    console.log('🌐 Using REAL API combined dashboard data')
    
    const [dashboardResponse, transactionsResponse, categoriesResponse] = await Promise.all([
      dashboardService.getDashboardData(),
      transactionService.getRecentTransactions(5),
      categoryService.getCategories()
    ])
    
    return {
      dashboardData: dashboardResponse,
      recentTransactions: transactionsResponse,
      categories: categoriesResponse,
      summary: await transactionService.getTransactionSummary()
    }
  }
}

// Utility function to check current data source
export const getCurrentDataSource = () => 'api'