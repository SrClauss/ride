import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../../theme/uber-theme'
import FilterDrawer, { FilterOptions } from '../FilterDrawer'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={darkTheme}>
    {children}
  </ThemeProvider>
)

describe('FilterDrawer Component', () => {
  const mockOnApply = jest.fn()
  const mockOnClose = jest.fn()

  const defaultFilters: FilterOptions = {
    type: 'all',
    categories: [],
    dateRange: {
      start: '',
      end: ''
    },
    amountRange: {
      min: 0,
      max: 0
    },
    platforms: [],
    sortBy: 'date',
    sortOrder: 'desc'
  }

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onApplyFilters: mockOnApply
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar quando aberto', () => {
    render(
      <TestWrapper>
        <FilterDrawer {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText(/filtros avançados/i)).toBeInTheDocument()
  })

  it('não deve renderizar quando fechado', () => {
    render(
      <TestWrapper>
        <FilterDrawer {...defaultProps} open={false} />
      </TestWrapper>
    )

    expect(screen.queryByText(/filtros avançados/i)).not.toBeInTheDocument()
  })

  it('deve renderizar seções de filtro', () => {
    render(
      <TestWrapper>
        <FilterDrawer {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText(/tipo/i)).toBeInTheDocument()
    expect(screen.getByText(/categorias/i)).toBeInTheDocument()
    expect(screen.getByText(/período/i)).toBeInTheDocument()
  })

  it('deve exibir categorias de receita por padrão', () => {
    render(
      <TestWrapper>
        <FilterDrawer {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getAllByText('Uber')[0]).toBeInTheDocument()
    expect(screen.getAllByText('99')[0]).toBeInTheDocument()
  })
})
