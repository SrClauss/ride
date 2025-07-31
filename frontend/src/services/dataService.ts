/**
 * Data Service - Alterna entre Mock e API real baseado na variável de ambiente
 */
import { 
  mockDashboardData, 
  mockTransactions, 
  mockCategories,
  mockTransactionSummary,
  mockApiDelay,
  type MockTransaction,
  type MockDashboardData,
  type MockCategory
} from '../data/mockData'
import { api } from './api'

// Verifica se deve usar mock data
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'mock'

console.log(`🔧 Data Service: Using ${useMockData ? 'MOCK' : 'API'} data`)

/**
 * Dashboard Service
 */
export const dashboardService = {
  async getDashboardData(): Promise<MockDashboardData> {
    if (useMockData) {
      console.log('📊 Using MOCK dashboard data')
      await mockApiDelay()
      return mockDashboardData
    }
    
    console.log('🌐 Using REAL API dashboard data')
    try {
      const response = await api.get('/dashboard/summary')
      return response.data
    } catch (error) {
      console.warn('⚠️ API failed, falling back to mock data:', error)
      return mockDashboardData
    }
  }
}

/**
 * Transaction Service  
 */
export const transactionService = {
  async getTransactions(page: number = 1, perPage: number = 50): Promise<{
    transactions: MockTransaction[]
    total: number
  }> {
    if (useMockData) {
      console.log('📊 Using MOCK transactions data')
      await mockApiDelay()
      
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedTransactions = mockTransactions.slice(startIndex, endIndex)
      
      return {
        transactions: paginatedTransactions,
        total: mockTransactions.length
      }
    }
    
    console.log('🌐 Using REAL API transactions data')
    try {
      const response = await api.get('/transactions', {
        params: { page, per_page: perPage }
      })
      
      return {
        transactions: response.data.data || [],
        total: response.data.pagination?.total || 0
      }
    } catch (error) {
      console.warn('⚠️ API failed, falling back to mock data:', error)
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedTransactions = mockTransactions.slice(startIndex, endIndex)
      
      return {
        transactions: paginatedTransactions,
        total: mockTransactions.length
      }
    }
  },

  async getRecentTransactions(limit: number = 5): Promise<MockTransaction[]> {
    if (useMockData) {
      console.log('📊 Using MOCK recent transactions')
      await mockApiDelay()
      return mockTransactions.slice(0, limit)
    }
    
    console.log('🌐 Using REAL API recent transactions')
    try {
      const response = await api.get('/transactions', {
        params: { page: 1, per_page: limit, ordenar_por: 'data', ordem: 'desc' }
      })
      
      return response.data.data || []
    } catch (error) {
      console.warn('⚠️ API failed, falling back to mock data:', error)
      return mockTransactions.slice(0, limit)
    }
  },

  async getTransactionSummary(): Promise<typeof mockTransactionSummary> {
    if (useMockData) {
      console.log('📊 Using MOCK transaction summary')
      await mockApiDelay()
      return mockTransactionSummary
    }
    
    console.log('🌐 Using REAL API transaction summary')
    try {
      const response = await api.get('/transactions/summary')
      return response.data
    } catch (error) {
      console.warn('⚠️ API failed, falling back to mock data:', error)
      return mockTransactionSummary
    }
  },

  async createTransaction(transactionData: any): Promise<MockTransaction> {
    if (useMockData) {
      console.log('📊 MOCK: Creating transaction', transactionData)
      await mockApiDelay()
      
      const newTransaction: MockTransaction = {
        id: `trans-${Date.now()}`,
        id_usuario: 'user-1',
        id_categoria: transactionData.id_categoria,
        valor: transactionData.valor,
        descricao: transactionData.descricao,
        tipo: transactionData.tipo,
        data: transactionData.data || new Date().toISOString(),
        origem: 'manual',
        criado_em: new Date().toISOString(),
        nome_categoria: mockCategories.find(c => c.id === transactionData.id_categoria)?.nome || 'Categoria'
      }
      
      // Simula adicionar à lista de transações mock
      mockTransactions.unshift(newTransaction)
      return newTransaction
    }
    
    console.log('🌐 REAL API: Creating transaction')
    const response = await api.post('/transactions', transactionData)
    return response.data.data
  }
}

/**
 * Category Service
 */
export const categoryService = {
  async getCategories(): Promise<MockCategory[]> {
    if (useMockData) {
      console.log('📊 Using MOCK categories data')
      await mockApiDelay()
      return mockCategories
    }
    
    console.log('🌐 Using REAL API categories data')
    try {
      const response = await api.get('/categories')
      return response.data.data || []
    } catch (error) {
      console.warn('⚠️ API failed, falling back to mock data:', error)
      return mockCategories
    }
  },

  async createCategory(categoryData: any): Promise<MockCategory> {
    if (useMockData) {
      console.log('📊 MOCK: Creating category', categoryData)
      await mockApiDelay()
      
      const newCategory: MockCategory = {
        id: `cat-${Date.now()}`,
        id_usuario: 'user-1',
        nome: categoryData.nome,
        tipo: categoryData.tipo,
        cor: categoryData.cor || '#000000',
        eh_ativa: true,
        criado_em: new Date().toISOString()
      }
      
      mockCategories.push(newCategory)
      return newCategory
    }
    
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
    if (useMockData) {
      console.log('📊 Using MOCK combined dashboard data')
      await mockApiDelay()
      
      return {
        dashboardData: mockDashboardData,
        recentTransactions: mockTransactions.slice(0, 5),
        categories: mockCategories,
        summary: mockTransactionSummary
      }
    }
    
    console.log('🌐 Using REAL API combined dashboard data')
    try {
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
    } catch (error) {
      console.warn('⚠️ Combined API failed, falling back to mock data:', error)
      return {
        dashboardData: mockDashboardData,
        recentTransactions: mockTransactions.slice(0, 5),
        categories: mockCategories,
        summary: mockTransactionSummary
      }
    }
  }
}

// Utility function to check current data source
export const getCurrentDataSource = () => useMockData ? 'mock' : 'api'

// Function to toggle data source (for development)
export const toggleDataSource = () => {
  console.warn('⚠️ Data source toggle is only available through environment variables')
  console.log(`Current source: ${getCurrentDataSource()}`)
  console.log('To change, update NEXT_PUBLIC_USE_MOCK_DATA in .env.local')
}
