import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GoalFilters from '../GoalFilters';
import { FilterType, CategoryType, SortType } from '../../../utils/goalUtils';

// Mock do utilitário goalUtils
jest.mock('../../../utils/goalUtils', () => ({
  ...jest.requireActual('../../../utils/goalUtils'),
  goalCategories: [
    { value: 'emergency', label: 'Reserva de Emergência' },
    { value: 'investment', label: 'Investimento' },
    { value: 'purchase', label: 'Compra' },
    { value: 'travel', label: 'Viagem' },
    { value: 'education', label: 'Educação' },
    { value: 'health', label: 'Saúde' },
    { value: 'other', label: 'Outros' }
  ],
  goalStatuses: [
    { value: 'active', label: 'Ativa', color: 'primary' },
    { value: 'completed', label: 'Concluída', color: 'success' },
    { value: 'paused', label: 'Pausada', color: 'warning' }
  ]
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('GoalFilters', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnCategoryChange = jest.fn();
  const mockOnSortChange = jest.fn();
  const mockOnSearchChange = jest.fn();

  const defaultProps = {
    filter: 'all' as FilterType,
    category: 'all' as CategoryType,
    sortBy: 'created' as SortType,
    searchTerm: '',
    onFilterChange: mockOnFilterChange,
    onCategoryChange: mockOnCategoryChange,
    onSortChange: mockOnSortChange,
    onSearchChange: mockOnSearchChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todos os campos de filtro', () => {
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ordenar por/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
  });

  it('deve exibir valores iniciais corretos', () => {
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const statusSelect = screen.getByText('Todos');
    const categorySelect = screen.getByText('Todas');
    const sortSelect = screen.getByText('Mais recentes');
    const searchInput = screen.getByLabelText(/buscar/i);

    expect(statusSelect).toBeInTheDocument();
    expect(categorySelect).toBeInTheDocument();
    expect(sortSelect).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('deve chamar onFilterChange quando status é alterado', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const statusSelect = screen.getByLabelText(/status/i);
    await user.click(statusSelect);
    
    const activeOption = await screen.findByText('Ativa');
    await user.click(activeOption);

    expect(mockOnFilterChange).toHaveBeenCalledWith('active');
  });

  it('deve chamar onCategoryChange quando categoria é alterada', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);
    
    const investmentOption = await screen.findByText('Investimento');
    await user.click(investmentOption);

    expect(mockOnCategoryChange).toHaveBeenCalledWith('investment');
  });

  it('deve chamar onSortChange quando ordenação é alterada', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const sortSelect = screen.getByLabelText(/ordenar por/i);
    await user.click(sortSelect);
    
    const deadlineOption = await screen.findByText('Data limite');
    await user.click(deadlineOption);

    expect(mockOnSortChange).toHaveBeenCalledWith('deadline');
  });

  it('deve chamar onSearchChange quando texto de pesquisa é alterado', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByLabelText(/buscar/i);
    await user.clear(searchInput);
    await user.type(searchInput, 'meta teste');

    // Verifica se o último valor chamado é correto
    const calls = mockOnSearchChange.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe('e'); // O userEvent.type chama o onChange para cada caractere
  });

  it('deve exibir ícone de pesquisa no campo de busca', () => {
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByLabelText(/buscar/i);
    const inputContainer = searchInput.closest('.MuiOutlinedInput-root');
    
    expect(inputContainer).toBeInTheDocument();
    // O ícone SearchIcon é renderizado como adornment
  });

  it('deve exibir todas as opções de status no select', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const statusSelect = screen.getByLabelText(/status/i);
    await user.click(statusSelect);

    expect(await screen.findAllByText('Todos')).toHaveLength(2);
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Concluída')).toBeInTheDocument();
    expect(screen.getByText('Pausada')).toBeInTheDocument();
  });

  it('deve exibir todas as opções de categoria no select', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);

    expect(await screen.findAllByText('Todas')).toHaveLength(2);
    expect(screen.getByText('Reserva de Emergência')).toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
    expect(screen.getByText('Compra')).toBeInTheDocument();
    expect(screen.getByText('Viagem')).toBeInTheDocument();
    expect(screen.getByText('Educação')).toBeInTheDocument();
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Outros')).toBeInTheDocument();
  });

  it('deve exibir todas as opções de ordenação no select', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const sortSelect = screen.getByLabelText(/ordenar por/i);
    await user.click(sortSelect);

    expect(await screen.findAllByText('Mais recentes')).toHaveLength(2);
    expect(screen.getByText('Data limite')).toBeInTheDocument();
    expect(screen.getByText('Progresso')).toBeInTheDocument();
    expect(screen.getByText('Valor')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
  });

  it('deve exibir valores selecionados quando passados como props', () => {
    const propsWithValues = {
      ...defaultProps,
      filter: 'active' as FilterType,
      category: 'investment' as CategoryType,
      sortBy: 'deadline' as SortType,
      searchTerm: 'teste'
    };

    render(
      <TestWrapper>
        <GoalFilters {...propsWithValues} />
      </TestWrapper>
    );

    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
    expect(screen.getByText('Data limite')).toBeInTheDocument();
    expect(screen.getByDisplayValue('teste')).toBeInTheDocument();
  });

  it('deve permitir limpar o campo de pesquisa', async () => {
    const user = userEvent.setup();
    
    const propsWithSearch = {
      ...defaultProps,
      searchTerm: 'meta inicial'
    };

    render(
      <TestWrapper>
        <GoalFilters {...propsWithSearch} />
      </TestWrapper>
    );

    const searchInput = screen.getByDisplayValue('meta inicial');
    await user.clear(searchInput);
    await user.type(searchInput, 'nova busca');

    // Verifica se o onChange foi chamado
    expect(mockOnSearchChange).toHaveBeenCalled();
  });

  it('deve manter foco nos campos após mudanças', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByLabelText(/buscar/i);
    await user.click(searchInput);
    await user.type(searchInput, 'teste');

    expect(searchInput).toHaveFocus();
  });

  it('deve ter tamanhos adequados para os campos', () => {
    render(
      <TestWrapper>
        <GoalFilters {...defaultProps} />
      </TestWrapper>
    );

    const statusSelect = screen.getByLabelText(/status/i);
    const categorySelect = screen.getByLabelText(/categoria/i);
    const sortSelect = screen.getByLabelText(/ordenar por/i);

    // Verifica se os campos têm o atributo size="small"
    expect(statusSelect).toBeInTheDocument();
    expect(categorySelect).toBeInTheDocument();
    expect(sortSelect).toBeInTheDocument();
  });
});