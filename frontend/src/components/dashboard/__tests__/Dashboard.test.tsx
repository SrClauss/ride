import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../../theme/uber-theme'
import Dashboard from '../Dashboard'
import { AppContext } from '../../../store/context'
import { mockAppState } from './__mocks__/dashboardMockData'

// Mock do useApp hook
const mockDispatch = jest.fn()
const mockActions = {
  setUser: jest.fn(),
  setAuthenticated: jest.fn(),
  setPaidStatus: jest.fn(),
  logout: jest.fn(),
  setTheme: jest.fn(),
  setSidebar: jest.fn(),
  toggleSidebar: jest.fn(),
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
      expect(screen.getByText('+3')).toBeInTheDocument()
      expect(screen.getByText('+1.5h')).toBeInTheDocument()
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

      expect(screen.getByText('Corrida Centro → Aeroporto')).toBeInTheDocument()
      expect(screen.getByText('Viagem Zona Sul')).toBeInTheDocument()
      expect(screen.getByText('Abastecimento Completo')).toBeInTheDocument()
    })

    it('deve exibir valores das transações formatados', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('+R$ 34,50')).toBeInTheDocument()
      expect(screen.getByText('+R$ 28,90')).toBeInTheDocument()
      expect(screen.getByText('-R$ 85,00')).toBeInTheDocument()
    })

    it('deve exibir categorias e horários das transações', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('Uber • 16:45')).toBeInTheDocument()
      expect(screen.getByText('99 • 15:30')).toBeInTheDocument()
      expect(screen.getByText('Combustível • 14:30')).toBeInTheDocument()
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
          fullName: undefined,
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
          fullName: undefined,
          username: undefined
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

      expect(screen.getByText(/Bem-vindo de volta, Usuário!/)).toBeInTheDocument()
    })
  })
})
