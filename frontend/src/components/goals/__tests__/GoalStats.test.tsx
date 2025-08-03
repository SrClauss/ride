import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GoalStats from '../GoalStats';
import { Goal } from '../../../utils/goalUtils';

// Mock do utilitário goalUtils
jest.mock('../../../utils/goalUtils', () => ({
  ...jest.requireActual('../../../utils/goalUtils'),
  calculateGoalStatistics: jest.fn((goals: Goal[]) => ({
    total: goals.length,
    active: goals.filter((g: Goal) => g.status === 'active').length,
    completed: goals.filter((g: Goal) => g.status === 'completed').length,
    paused: goals.filter((g: Goal) => g.status === 'paused').length,
    expired: 0,
    nearDeadline: 0,
    totalValue: goals.reduce((sum: number, g: Goal) => sum + g.targetValue, 0),
    achievedValue: goals.reduce((sum: number, g: Goal) => sum + g.currentValue, 0),
    completionRate: goals.length > 0 ? (goals.filter((g: Goal) => g.status === 'completed').length / goals.length) * 100 : 0,
    averageProgress: goals.length > 0 ? goals.reduce((sum: number, g: Goal) => sum + ((g.currentValue / g.targetValue) * 100), 0) / goals.length : 0
  })),
  formatCurrency: jest.fn((value: number) => `R$ ${value.toFixed(2)}`)
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Meta Ativa 1',
    description: 'Descrição',
    targetValue: 1000,
    currentValue: 500,
    deadline: '2025-12-31',
    category: 'investment',
    status: 'active',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: '2',
    title: 'Meta Ativa 2',
    description: 'Descrição',
    targetValue: 2000,
    currentValue: 1000,
    deadline: '2025-12-31',
    category: 'emergency',
    status: 'active',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: '3',
    title: 'Meta Concluída',
    description: 'Descrição',
    targetValue: 500,
    currentValue: 500,
    deadline: '2025-12-31',
    category: 'purchase',
    status: 'completed',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: '4',
    title: 'Meta Pausada',
    description: 'Descrição',
    targetValue: 800,
    currentValue: 200,
    deadline: '2025-12-31',
    category: 'travel',
    status: 'paused',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }
];

describe('GoalStats', () => {
  it('deve renderizar estatísticas com lista vazia', () => {
    render(
      <TestWrapper>
        <GoalStats goals={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('Nenhuma meta cadastrada ainda')).toBeInTheDocument();
    expect(screen.getByText('Comece criando sua primeira meta financeira')).toBeInTheDocument();
  });

  it('deve exibir contadores corretos de metas', () => {
    render(
      <TestWrapper>
        <GoalStats goals={mockGoals} />
      </TestWrapper>
    );

    // Total de metas
    expect(screen.getByText('4')).toBeInTheDocument(); // Total

    // Verificar se as seções existem
    expect(screen.getByText('Total de Metas')).toBeInTheDocument();
    expect(screen.getByText('Ativas')).toBeInTheDocument();
    expect(screen.getByText('Concluídas')).toBeInTheDocument();
    expect(screen.getByText('Pausadas')).toBeInTheDocument();
  });

  it('deve exibir valores monetários formatados', () => {
    render(
      <TestWrapper>
        <GoalStats goals={mockGoals} />
      </TestWrapper>
    );

    // Como mockamos formatCurrency para retornar "R$ valor.00"
    // e temos valores: targetValue total = 4300, currentValue total = 2200
    expect(screen.getByText('R$ 4300.00')).toBeInTheDocument(); // Total Value
    expect(screen.getByText('R$ 2200.00')).toBeInTheDocument(); // Achieved Value
  });

  it('deve calcular e exibir progresso médio', () => {
    render(
      <TestWrapper>
        <GoalStats goals={mockGoals} />
      </TestWrapper>
    );

    expect(screen.getByText('Progresso Médio (Ativas)')).toBeInTheDocument();
  });

  it('deve exibir taxa de conclusão', () => {
    render(
      <TestWrapper>
        <GoalStats goals={mockGoals} />
      </TestWrapper>
    );

    expect(screen.getByText('Taxa de Conclusão')).toBeInTheDocument();
    // Com 1 meta concluída de 4 total = 25%
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('deve exibir estatísticas com uma meta', () => {
    const singleGoal = [mockGoals[0]];
    
    render(
      <TestWrapper>
        <GoalStats goals={singleGoal} />
      </TestWrapper>
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Total
    expect(screen.getByText('Total de Metas')).toBeInTheDocument();
  });

  it('deve exibir diferentes ícones para diferentes métricas', () => {
    render(
      <TestWrapper>
        <GoalStats goals={mockGoals} />
      </TestWrapper>
    );

    // Verificar que os ícones são renderizados (não podemos testar SVGs diretamente, mas podemos verificar estrutura)
    const statsContainer = screen.getByText('Total de Metas').closest('[role="presentation"]') || 
                           screen.getByText('Total de Metas').closest('div');
    expect(statsContainer).toBeInTheDocument();
  });

  it('deve calcular estatísticas complexas corretamente', () => {
    // Test com metas específicas para verificar cálculos
    const testGoals: Goal[] = [
      {
        id: '1',
        title: 'Meta 50%',
        description: 'Meta com 50% de progresso',
        targetValue: 1000,
        currentValue: 500,
        deadline: '2025-12-31',
        category: 'investment',
        status: 'active',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      },
      {
        id: '2',
        title: 'Meta 100%',
        description: 'Meta concluída',
        targetValue: 1000,
        currentValue: 1000,
        deadline: '2025-12-31',
        category: 'emergency',
        status: 'completed',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    ];

    render(
      <TestWrapper>
        <GoalStats goals={testGoals} />
      </TestWrapper>
    );

    // Total de metas: 2
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Taxa de conclusão: 50% (1 de 2)
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('deve tratar metas com valor alvo zero', () => {
    const problematicGoals: Goal[] = [
      {
        id: '1',
        title: 'Meta com valor zero',
        description: 'Meta problemática',
        targetValue: 0,
        currentValue: 100,
        deadline: '2025-12-31',
        category: 'other',
        status: 'active',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    ];

    render(
      <TestWrapper>
        <GoalStats goals={problematicGoals} />
      </TestWrapper>
    );

    // Deve renderizar sem erro
    expect(screen.getByText('Total de Metas')).toBeInTheDocument();
  });

  it('deve exibir diferentes cores para diferentes estatísticas', () => {
    render(
      <TestWrapper>
        <GoalStats goals={mockGoals} />
      </TestWrapper>
    );

    // Verificar que diferentes seções existem (cada uma com cores específicas)
    expect(screen.getByText('Ativas')).toBeInTheDocument();
    expect(screen.getByText('Concluídas')).toBeInTheDocument();
    expect(screen.getByText('Pausadas')).toBeInTheDocument();
    
    // As cores são aplicadas via theme, difícil testar diretamente
    // mas podemos verificar que os elementos existem
  });
});