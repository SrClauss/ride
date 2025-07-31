import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../../theme/uber-theme'
import TransactionList from '../TransactionList'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={darkTheme}>
    {children}
  </ThemeProvider>
)

describe('TransactionList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar o componente sem erros', () => {
    render(
      <TestWrapper>
        <TransactionList />
      </TestWrapper>
    )

    expect(screen.getByText('Transações')).toBeInTheDocument()
  })

  it('deve renderizar barra de pesquisa', () => {
    render(
      <TestWrapper>
        <TransactionList />
      </TestWrapper>
    )

    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toBeInTheDocument()
  })

  it('deve renderizar transações mocadas', () => {
    render(
      <TestWrapper>
        <TransactionList />
      </TestWrapper>
    )

    expect(screen.getByText(/centro para aeroporto/i)).toBeInTheDocument()
    expect(screen.getAllByText(/combustível/i)[0]).toBeInTheDocument()
  })

  it('deve exibir valores das transações', () => {
    render(
      <TestWrapper>
        <TransactionList />
      </TestWrapper>
    )

    expect(screen.getAllByText(/\+R\$ 45,50/)).toHaveLength(2) // Mobile + Desktop
    expect(screen.getAllByText(/-R\$ 120,00/)).toHaveLength(2) // Mobile + Desktop
  })
})
