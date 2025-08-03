import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GoalCard from '../GoalCard';
import { Goal } from '../../../utils/goalUtils';

// Mock do utilitário goalUtils
jest.mock('../../../utils/goalUtils', () => ({
  ...jest.requireActual('../../../utils/goalUtils'),
  calculateProgress: jest.fn((current, target) => (current / target) * 100),
  formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
  getDaysUntilDeadline: jest.fn(() => 30),
  getProgressColor: jest.fn(() => 'primary'),
  isGoalExpired: jest.fn(() => false)
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

const mockGoalCompleted: Goal = {
  ...mockGoal,
  id: '2',
  title: 'Meta Concluída',
  currentValue: 1000,
  status: 'completed'
};

describe('GoalCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnUpdateProgress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar corretamente os dados da meta', () => {
    render(
      <TestWrapper>
        <GoalCard goal={mockGoal} />
      </TestWrapper>
    );

    expect(screen.getByText('Meta de Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição da meta de teste')).toBeInTheDocument();
    expect(screen.getByText('R$ 500.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1000.00')).toBeInTheDocument();
  });

  it('deve exibir o status correto da meta', () => {
    render(
      <TestWrapper>
        <GoalCard goal={mockGoal} />
      </TestWrapper>
    );

    expect(screen.getByText('Ativa')).toBeInTheDocument();
  });

  it('deve exibir meta concluída', () => {
    render(
      <TestWrapper>
        <GoalCard goal={mockGoalCompleted} />
      </TestWrapper>
    );

    // Use getAllByText para verificar múltiplos elementos com "Concluída"
    const concluidas = screen.getAllByText('Concluída');
    expect(concluidas).toHaveLength(2); // Uma no chip de status, outra no prazo
  });

  it('deve abrir menu de opções ao clicar no ícone', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalCard 
          goal={mockGoal} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const menuButton = screen.getByLabelText(/opções/i);
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
      expect(screen.getByText('Excluir')).toBeInTheDocument();
    });
  });

  it('deve chamar onEdit ao clicar em Editar', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalCard 
          goal={mockGoal} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const menuButton = screen.getByLabelText(/opções/i);
    await user.click(menuButton);

    const editButton = await screen.findByText('Editar');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockGoal);
  });

  it('deve chamar onDelete ao clicar em Excluir', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(
      <TestWrapper>
        <GoalCard 
          goal={mockGoal} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const menuButton = screen.getByLabelText(/opções/i);
    await user.click(menuButton);

    const deleteButton = await screen.findByText('Excluir');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockGoal.id);
    confirmSpy.mockRestore();
  });

  it('deve abrir modal de atualização de progresso', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalCard 
          goal={mockGoal} 
          onUpdateProgress={mockOnUpdateProgress}
        />
      </TestWrapper>
    );

    const menuButton = screen.getByLabelText(/opções/i);
    await user.click(menuButton);

    const updateButton = await screen.findByText('Atualizar Progresso');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Progresso')).toBeInTheDocument();
    });
  });

  it('deve atualizar progresso com novo valor', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <GoalCard 
          goal={mockGoal} 
          onUpdateProgress={mockOnUpdateProgress}
        />
      </TestWrapper>
    );

    const menuButton = screen.getByLabelText(/opções/i);
    await user.click(menuButton);

    const updateButton = await screen.findByText('Atualizar Progresso');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Progresso')).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('500');
    await user.clear(input);
    await user.type(input, '750');

    const saveButton = screen.getByText('Atualizar');
    await user.click(saveButton);

    expect(mockOnUpdateProgress).toHaveBeenCalledWith(mockGoal.id, 750);
  });

  it('deve exibir diferentes cores para diferentes categorias', () => {
    const emergencyGoal = { ...mockGoal, category: 'emergency' };
    
    render(
      <TestWrapper>
        <GoalCard goal={emergencyGoal} />
      </TestWrapper>
    );

    // Verifica se o componente renderiza sem erro com categoria emergency
    expect(screen.getByText('Meta de Teste')).toBeInTheDocument();
  });

  it('deve exibir prazo da meta', () => {
    render(
      <TestWrapper>
        <GoalCard goal={mockGoal} />
      </TestWrapper>
    );

    // Como mockamos getDaysUntilDeadline para retornar 30
    expect(screen.getByText(/30 dias restantes/)).toBeInTheDocument();
  });
});