import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../../theme/uber-theme'
import TransactionModal from '../TransactionModal'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={darkTheme}>
    {children}
  </ThemeProvider>
)

describe('TransactionModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar modal quando aberto', () => {
    render(
      <TestWrapper>
        <TransactionModal {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText(/nova transação/i)).toBeInTheDocument()
  })

  it('não deve renderizar quando fechado', () => {
    render(
      <TestWrapper>
        <TransactionModal {...defaultProps} open={false} />
      </TestWrapper>
    )

    expect(screen.queryByText(/nova transação/i)).not.toBeInTheDocument()
  })

  it('deve renderizar campos do formulário', () => {
    render(
      <TestWrapper>
        <TransactionModal {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText(/tipo de transação/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
    expect(screen.getAllByText(/categoria/i)[0]).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
  })

  it('deve ter botão "Adicionar"', () => {
    render(
      <TestWrapper>
        <TransactionModal {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText(/adicionar/i)).toBeInTheDocument()
  })
})
