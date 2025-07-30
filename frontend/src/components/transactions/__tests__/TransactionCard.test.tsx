import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../../theme/uber-theme'
import TransactionCard from '../TransactionCard'

// Mock do FontAwesome
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span data-testid={`fa-icon-${icon.iconName}`} {...props} />
  )
}))

// Wrapper com ThemeProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={darkTheme}>
    {children}
  </ThemeProvider>
)

describe('TransactionCard Component - Testes Básicos', () => {
  const mockOnMenuClick = jest.fn()

  const incomeTransaction = {
    id: 1,
    description: 'Corrida Centro → Aeroporto',
    amount: 34.50,
    type: 'income' as const,
    category: 'Uber',
    date: '2025-07-30',
    time: '16:45',
    status: 'completed' as const,
    platform: 'Uber',
    location: 'São Paulo, SP'
  }

  const expenseTransaction = {
    id: 2,
    description: 'Abastecimento Completo',
    amount: 85.00,
    type: 'expense' as const,
    category: 'Combustível',
    date: '2025-07-30',
    time: '14:30',
    status: 'completed' as const,
    location: 'Posto Ipiranga'
  }

  const pendingTransaction = {
    id: 3,
    description: 'Corrida Shopping Center',
    amount: 22.75,
    type: 'income' as const,
    category: 'InDriver',
    date: '2025-07-30',
    time: '14:15',
    status: 'pending' as const,
    platform: 'InDriver',
    location: 'São Paulo, SP'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar transação de receita básica', () => {
    render(
      <TestWrapper>
        <TransactionCard 
          transaction={incomeTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Corrida Centro → Aeroporto')).toBeInTheDocument()
    expect(screen.getByText('Uber')).toBeInTheDocument()
    expect(screen.getByText('16:45')).toBeInTheDocument()
    expect(screen.getByText('São Paulo, SP')).toBeInTheDocument()
  })

  it('deve renderizar transação de despesa básica', () => {
    render(
      <TestWrapper>
        <TransactionCard 
          transaction={expenseTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Abastecimento Completo')).toBeInTheDocument()
    expect(screen.getByText('Combustível')).toBeInTheDocument()
    expect(screen.getByText('14:30')).toBeInTheDocument()
    expect(screen.getByText('Posto Ipiranga')).toBeInTheDocument()
  })

  it('deve renderizar transação pendente', () => {
    render(
      <TestWrapper>
        <TransactionCard 
          transaction={pendingTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Corrida Shopping Center')).toBeInTheDocument()
    expect(screen.getByText('InDriver')).toBeInTheDocument()
    expect(screen.getByText('14:15')).toBeInTheDocument()
    expect(screen.getAllByText('Pendente')).toHaveLength(2) // Mobile + Desktop
  })

  it('deve exibir valores monetários formatados', () => {
    const { rerender } = render(
      <TestWrapper>
        <TransactionCard 
          transaction={incomeTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getAllByText('+R$ 34,50')).toHaveLength(2) // Mobile + Desktop

    rerender(
      <TestWrapper>
        <TransactionCard 
          transaction={expenseTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getAllByText('-R$ 85,00')).toHaveLength(2) // Mobile + Desktop
  })

  it('deve exibir status correto', () => {
    const { rerender } = render(
      <TestWrapper>
        <TransactionCard 
          transaction={incomeTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getAllByText('Concluída')).toHaveLength(2) // Mobile + Desktop

    rerender(
      <TestWrapper>
        <TransactionCard 
          transaction={pendingTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getAllByText('Pendente')).toHaveLength(2) // Mobile + Desktop
  })

  it('deve exibir ícones FontAwesome', () => {
    render(
      <TestWrapper>
        <TransactionCard 
          transaction={incomeTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('fa-icon-uber')).toBeInTheDocument()
  })

  it('deve renderizar botão de menu', () => {
    render(
      <TestWrapper>
        <TransactionCard 
          transaction={incomeTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    const menuButtons = screen.getAllByRole('button')
    expect(menuButtons).toHaveLength(2) // Mobile + Desktop
    expect(menuButtons[0]).toBeInTheDocument()
  })

  it('deve chamar onMenuClick quando botão é clicado', () => {
    render(
      <TestWrapper>
        <TransactionCard 
          transaction={incomeTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    const menuButton = screen.getAllByRole('button')[0] // Pega o primeiro botão
    fireEvent.click(menuButton)

    expect(mockOnMenuClick).toHaveBeenCalledWith(expect.any(Object), incomeTransaction.id)
  })

  it('deve renderizar corretamente no tema escuro', () => {
    render(
      <TestWrapper>
        <TransactionCard 
          transaction={incomeTransaction}
          onMenuClick={mockOnMenuClick}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Corrida Centro → Aeroporto')).toBeInTheDocument()
  })
})
