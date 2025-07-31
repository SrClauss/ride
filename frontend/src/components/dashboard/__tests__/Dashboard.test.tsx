import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../../theme/uber-theme'
import Dashboard from '../Dashboard'
import { AppContext } from '../../../store/context'
import { mockAppState } from '../mocks/dashboardMockData'
import { LoadingState, ErrorState } from '../../../types'

// Mocks dos hooks de API
jest.mock('../../../hooks/useTransactionsApi', () => ({
  useTransactionsData: () => ({
    transactions: [
      {
        id: "trans-1",
        id_usuario: "user-1",
        id_categoria: "cat-1",
        valor: 45.50,
        descricao: "Corrida Uber - Centro para Aeroporto",
        tipo: "receita",
        data: "2024-07-30T16:45:00Z",
        criado_em: "2024-07-30T16:45:00Z",
        nome_categoria: "Uber"
      },
      {
        id: "trans-2", 
        id_usuario: "user-1",
        id_categoria: "cat-2",
        valor: 28.75,
        descricao: "Corrida 99 - Shopping para Casa",
        tipo: "receita",
        data: "2024-07-30T15:30:00Z",
        criado_em: "2024-07-30T15:30:00Z",
        nome_categoria: "99"
      },
      {
        id: "trans-3",
        id_usuario: "user-1", 
        id_categoria: "cat-3",
        valor: 85.00,
        descricao: "Abastecimento Completo",
        tipo: "despesa",
        data: "2024-07-30T12:30:00Z",
        criado_em: "2024-07-30T12:30:00Z",
        nome_categoria: "Combustível"
      }
    ],
    loading: false,
    error: null,
    refetch: jest.fn(),
    total: 3
  })
}))

jest.mock('../../../hooks/useDashboardApi', () => ({
  useDashboardData: () => ({
    data: {
      ganhos_hoje: 287.50,
      gastos_hoje: 95.20,
      lucro_hoje: 192.30,
      corridas_hoje: 14,
      horas_hoje: 8.5,
      eficiencia: 85,
      ganhos_semana: 1420.30,
      gastos_semana: 456.80,
      lucro_semana: 963.50,
      corridas_semana: 73,
      horas_semana: 42,
      meta_diaria: 250.00,
      meta_semanal: 1750.00,
      tendencia_ganhos: 12.5,
      tendencia_gastos: -8.2,
      tendencia_corridas: 15.3
    },
    loading: false,
    error: null,
    refetch: jest.fn(),
  })
}))

jest.mock('../../../hooks/useCategoriesApi', () => ({
  useCategoriesApi: () => ({
    categories: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  })
}))

jest.mock('../../../services/dataService', () => ({
  getCurrentDataSource: () => 'mock'
}))

// Mock do useApp hook
const mockDispatch = jest.fn()
const mockActions = {
  // Auth
  setUser: jest.fn(() => ({ type: 'SET_USER' as const, payload: null })),
  setAuthenticated: jest.fn((authenticated: boolean) => ({ type: 'SET_AUTHENTICATED' as const, payload: authenticated })),
  setPaidStatus: jest.fn((isPaid: boolean) => ({ type: 'SET_PAID_STATUS' as const, payload: isPaid })),
  logout: jest.fn(() => ({ type: 'LOGOUT' as const })),
  
  // Transactions
  setTransactions: jest.fn((transactions: any[]) => ({ type: 'SET_TRANSACTIONS' as const, payload: transactions })),
  addTransaction: jest.fn((transaction: any) => ({ type: 'ADD_TRANSACTION' as const, payload: transaction })),
  updateTransaction: jest.fn((transaction: any) => ({ type: 'UPDATE_TRANSACTION' as const, payload: transaction })),
  deleteTransaction: jest.fn((id: number) => ({ type: 'DELETE_TRANSACTION' as const, payload: id })),
  
  // Goals
  setGoals: jest.fn((goals: any[]) => ({ type: 'SET_GOALS' as const, payload: goals })),
  addGoal: jest.fn((goal: any) => ({ type: 'ADD_GOAL' as const, payload: goal })),
  updateGoal: jest.fn((goal: any) => ({ type: 'UPDATE_GOAL' as const, payload: goal })),
  deleteGoal: jest.fn((id: number) => ({ type: 'DELETE_GOAL' as const, payload: id })),
  
  // Categories
  setCategories: jest.fn((categories: any[]) => ({ type: 'SET_CATEGORIES' as const, payload: categories })),
  addCategory: jest.fn((category: any) => ({ type: 'ADD_CATEGORY' as const, payload: category })),
  updateCategory: jest.fn((category: any) => ({ type: 'UPDATE_CATEGORY' as const, payload: category })),
  deleteCategory: jest.fn((id: number) => ({ type: 'DELETE_CATEGORY' as const, payload: id })),
  
  // Sessions
  setSessions: jest.fn((sessions: any[]) => ({ type: 'SET_SESSIONS' as const, payload: sessions })),
  addSession: jest.fn((session: any) => ({ type: 'ADD_SESSION' as const, payload: session })),
  updateSession: jest.fn((session: any) => ({ type: 'UPDATE_SESSION' as const, payload: session })),
  deleteSession: jest.fn((id: number) => ({ type: 'DELETE_SESSION' as const, payload: id })),
  
  // Loading
  setLoading: jest.fn((key: keyof LoadingState, value: boolean) => ({ type: 'SET_LOADING' as const, payload: { key, value } })),
  
  // Errors
  setError: jest.fn((key: keyof ErrorState, value: string | null) => ({ type: 'SET_ERROR' as const, payload: { key, value } })),
  clearErrors: jest.fn(() => ({ type: 'CLEAR_ERRORS' as const })),
  
  // UI
  setTheme: jest.fn((theme: 'light' | 'dark') => ({ type: 'SET_THEME' as const, payload: theme })),
  toggleSidebar: jest.fn(() => ({ type: 'TOGGLE_SIDEBAR' as const })),
  setSidebar: jest.fn((open: boolean) => ({ type: 'SET_SIDEBAR' as const, payload: open })),
}

const mockContextValue = {
  state: mockAppState,
  dispatch: mockDispatch,
  actions: mockActions,
  login: jest.fn(),
  logout: jest.fn(),
  checkAuthStatus: jest.fn(),
}

// Wrapper com providers necessários
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={darkTheme}>
    <AppContext.Provider value={mockContextValue}>
      {children}
    </AppContext.Provider>
  </ThemeProvider>
)

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização Básica', () => {
    it('deve renderizar o dashboard sem erros', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/Bem-vindo de volta/)).toBeInTheDocument()
    })

    it('deve exibir mensagem de boas-vindas personalizada', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/Bem-vindo de volta/)).toBeInTheDocument()
      expect(screen.getByText(/Acompanhe seus ganhos em tempo real/)).toBeInTheDocument()
    })

    it('deve renderizar todos os cards de estatísticas', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('Ganhos Hoje')).toBeInTheDocument()
      expect(screen.getByText('Gastos Hoje')).toBeInTheDocument()
      expect(screen.getByText('Corridas')).toBeInTheDocument()
      expect(screen.getByText('Horas Online')).toBeInTheDocument()
    })
  })

  describe('Exibição de Dados', () => {
    it('deve exibir valores monetários formatados corretamente nos cards', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Usar getAllByText para múltiplas ocorrências
      const values287 = screen.getAllByText('R$ 287,50')
      expect(values287.length).toBeGreaterThan(0) // Aparece nos cards e nas metas
      
      expect(screen.getByText('R$ 95,20')).toBeInTheDocument()  // Gastos hoje
    })

    it('deve exibir número de corridas e horas', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('14')).toBeInTheDocument()    // Número de corridas
      expect(screen.getByText('8.5h')).toBeInTheDocument() // Horas online
    })

    it('deve exibir trends/percentuais', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('+12.5%')).toBeInTheDocument()
      expect(screen.getByText('-8.2%')).toBeInTheDocument()
      expect(screen.getByText('+15.3%')).toBeInTheDocument() // trend de corridas
      expect(screen.getByText('+0.9h')).toBeInTheDocument() // trend de horas (calculado)
    })
  })

  describe('Seção de Metas', () => {
    it('deve renderizar as metas diária e semanal', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('Progresso das Metas')).toBeInTheDocument()
      expect(screen.getByText('Meta Diária')).toBeInTheDocument()
      expect(screen.getByText('Meta Semanal')).toBeInTheDocument()
    })

    it('deve calcular progresso das metas corretamente', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Meta diária: 287.50 / 250 = 115%
      expect(screen.getByText('115%')).toBeInTheDocument()
      
      // Meta semanal: 1420.30 / 1750 = ~81%
      expect(screen.getByText('81%')).toBeInTheDocument()
    })

    it('deve exibir valores das metas formatados', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Usar getAllByText para valores que aparecem múltiplas vezes
      const values287 = screen.getAllByText('R$ 287,50')
      const values250 = screen.getAllByText('R$ 250,00')
      const values1420 = screen.getAllByText('R$ 1.420,30')
      const values1750 = screen.getAllByText('R$ 1.750,00')
      
      expect(values287.length).toBeGreaterThan(0)
      expect(values250.length).toBeGreaterThan(0)
      expect(values1420.length).toBeGreaterThan(0)
      expect(values1750.length).toBeGreaterThan(0)
    })
  })

  describe('Controle de Sessão', () => {
    it('deve renderizar botão de iniciar sessão quando inativo', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('Iniciar Sessão')).toBeInTheDocument()
    })

    it('deve permitir iniciar uma sessão de trabalho', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const startButton = screen.getByText('Iniciar Sessão')
      fireEvent.click(startButton)

      expect(screen.getByText('Parar Sessão')).toBeInTheDocument()
    })
  })

  describe('Transações Recentes', () => {
    it('deve exibir transações quando não está vazio', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('Corrida Uber - Centro para Aeroporto')).toBeInTheDocument()
      expect(screen.getByText('Corrida 99 - Shopping para Casa')).toBeInTheDocument()
      expect(screen.getByText('Abastecimento Completo')).toBeInTheDocument()
    })

    it('deve exibir valores das transações formatados', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('+R$ 45,50')).toBeInTheDocument()
      expect(screen.getByText('+R$ 28,75')).toBeInTheDocument()
      expect(screen.getByText('-R$ 85,00')).toBeInTheDocument()
    })

    it('deve exibir categorias e horários das transações', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Verifica se a categoria e horário são exibidos juntos (convertido para horário local)
      expect(screen.getByText(/Uber • 13:45/)).toBeInTheDocument()
      expect(screen.getByText(/99 • 12:30/)).toBeInTheDocument()
      expect(screen.getByText(/Combustível • 09:30/)).toBeInTheDocument()
    })

    it('deve ter botões de ação para transações', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('Adicionar')).toBeInTheDocument()
      expect(screen.getByText('Ver Todas')).toBeInTheDocument()
    })
  })

  describe('Interações do Usuário', () => {
    it('deve permitir alternar estado da sessão', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const startButton = screen.getByText('Iniciar Sessão')
      fireEvent.click(startButton)

      expect(screen.getByText('Parar Sessão')).toBeInTheDocument()

      const stopButton = screen.getByText('Parar Sessão')
      fireEvent.click(stopButton)

      expect(screen.getByText('Iniciar Sessão')).toBeInTheDocument()
    })
  })

  describe('Fallbacks e Estados de Erro', () => {
    it('deve renderizar com usuário sem nome completo', () => {
      const stateWithoutFullName = {
        ...mockAppState,
        user: {
          ...mockAppState.user,
          fullName: null,
          username: 'testuser'
        }
      }

      const contextWithoutFullName = {
        ...mockContextValue,
        state: stateWithoutFullName
      }

      render(
        <ThemeProvider theme={darkTheme}>
          <AppContext.Provider value={contextWithoutFullName}>
            <Dashboard />
          </AppContext.Provider>
        </ThemeProvider>
      )

      expect(screen.getByText(/Bem-vindo de volta/)).toBeInTheDocument()
    })

    it('deve renderizar com usuário sem nome', () => {
      const stateWithoutName = {
        ...mockAppState,
        user: {
          ...mockAppState.user,
          fullName: null,
          username: 'user-sem-nome'
        }
      }

      const contextWithoutName = {
        ...mockContextValue,
        state: stateWithoutName
      }

      render(
        <ThemeProvider theme={darkTheme}>
          <AppContext.Provider value={contextWithoutName}>
            <Dashboard />
          </AppContext.Provider>
        </ThemeProvider>
      )

      expect(screen.getByText(/Bem-vindo de volta/)).toBeInTheDocument()
    })
  })
})
