import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GoalModal from '../GoalModal';
import { Goal } from '../../../utils/goalUtils';

// Mock do utilitário goalUtils
jest.mock('../../../utils/goalUtils', () => ({
  ...jest.requireActual('../../../utils/goalUtils'),
  goalCategories: [
    { value: 'emergency', label: 'Reserva de Emergência' },
    { value: 'investment', label: 'Investimento' },
    { value: 'purchase', label: 'Compra' }
  ],
  calculateProgress: jest.fn((current, target) => (current / target) * 100),
  formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
  createEmptyGoal: jest.fn(() => ({
    id: '',
    title: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    deadline: '',
    category: 'emergency',
    status: 'active',
    createdAt: '',
    updatedAt: ''
  }))
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const mockGoal: Goal = {
  id: '1',
  title: 'Meta de Teste',
  description: 'Descrição da meta de teste',
  targetValue: 1000,
  currentValue: 500,
  deadline: '2025-12-31',
  category: 'investment',
  status: 'active',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01'
};

describe('GoalModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar modal aberto para criar nova meta', () => {
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Nova Meta Financeira')).toBeInTheDocument();
    expect(screen.getByLabelText(/título da meta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor da meta/i)).toBeInTheDocument();
  });

  it('deve renderizar modal aberto para editar meta existente', () => {
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          goal={mockGoal}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Editar Meta')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Meta de Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descrição da meta de teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  it('não deve renderizar quando fechado', () => {
    render(
      <TestWrapper>
        <GoalModal 
          open={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Nova Meta')).not.toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão Cancelar', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve chamar onClose ao clicar no ícone de fechar', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    const closeButton = screen.getByLabelText(/close/i);
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve preencher formulário e salvar nova meta', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Preencher título
    const titleInput = screen.getByLabelText(/título da meta/i);
    await user.type(titleInput, 'Nova Meta de Teste');

    // Preencher descrição
    const descriptionInput = screen.getByLabelText(/descrição/i);
    await user.type(descriptionInput, 'Descrição da nova meta');

    // Preencher valor da meta
    const targetInput = screen.getByLabelText(/valor da meta/i);
    await user.type(targetInput, '2000');

    // Preencher deadline
    const deadlineInput = screen.getByLabelText(/data limite/i);
    await user.type(deadlineInput, '2025-12-31');

    // Selecionar categoria
    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);
    const investmentOption = await screen.findByText('Investimento');
    await user.click(investmentOption);

    // Salvar
    const saveButton = screen.getByText('Criar Meta');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nova Meta de Teste',
          description: 'Descrição da nova meta',
          targetValue: 2000,
          deadline: '2025-12-31',
          category: 'investment'
        })
      );
    });
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Tentar salvar sem preencher
    const saveButton = screen.getByText('Criar Meta');
    await user.click(saveButton);

    // Verificar se não chamou onSave devido à validação
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('deve atualizar valor atual em tempo real', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          goal={mockGoal}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    const currentValueInput = screen.getByLabelText(/valor atual/i);
    await user.clear(currentValueInput);
    await user.type(currentValueInput, '750');

    // Verificar se o progresso foi atualizado (seria calculado automaticamente)
    expect(currentValueInput).toHaveValue(750);
  });

  it('deve resetar formulário ao abrir para nova meta', () => {
    const { rerender } = render(
      <TestWrapper>
        <GoalModal 
          open={true}
          goal={mockGoal}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Verificar que tem dados da meta
    expect(screen.getByDisplayValue('Meta de Teste')).toBeInTheDocument();

    // Rerender sem goal (nova meta)
    rerender(
      <TestWrapper>
        <GoalModal 
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Verificar que o título está vazio (resetou)
    const titleInput = screen.getByLabelText(/título da meta/i);
    expect(titleInput).toHaveValue('');
  });

  it('deve permitir alteração de categoria', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalModal 
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);

    // Verificar se as opções aparecem
    expect(await screen.findByText('Investimento')).toBeInTheDocument();
    expect(screen.getByText('Compra')).toBeInTheDocument();
  });
});