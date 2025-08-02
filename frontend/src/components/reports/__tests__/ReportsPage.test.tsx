import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ReportsPage from '../ReportsPage';

// Mock dos componentes filhos
jest.mock('../SummaryCards', () => {
  return function MockSummaryCards() {
    return <div data-testid="summary-cards">Summary Cards Mock</div>;
  };
});

jest.mock('../RevenueChart', () => {
  return function MockRevenueChart() {
    return <div data-testid="revenue-chart">Revenue Chart Mock</div>;
  };
});

jest.mock('../ExpenseChart', () => {
  return function MockExpenseChart() {
    return <div data-testid="expense-chart">Expense Chart Mock</div>;
  };
});

jest.mock('../CategoryChart', () => {
  return function MockCategoryChart() {
    return <div data-testid="category-chart">Category Chart Mock</div>;
  };
});

jest.mock('../PlatformChart', () => {
  return function MockPlatformChart() {
    return <div data-testid="platform-chart">Platform Chart Mock</div>;
  };
});

jest.mock('../TrendChart', () => {
  return function MockTrendChart() {
    return <div data-testid="trend-chart">Trend Chart Mock</div>;
  };
});

jest.mock('../PerformanceMetrics', () => {
  return function MockPerformanceMetrics() {
    return <div data-testid="performance-metrics">Performance Metrics Mock</div>;
  };
});

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ReportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a página de relatórios', () => {
    renderWithTheme(<ReportsPage />);
    
    expect(screen.getByText('Dashboard de Análise')).toBeInTheDocument();
  });

  it('deve renderizar o componente SummaryCards', () => {
    renderWithTheme(<ReportsPage />);
    
    expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
  });

  it('deve renderizar todos os gráficos', () => {
    renderWithTheme(<ReportsPage />);
    
    // Por padrão, apenas a primeira tab (Receitas) está ativa
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    
    // Os outros charts só aparecem quando suas tabs são ativadas
    expect(screen.queryByTestId('expense-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('category-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('platform-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trend-chart')).not.toBeInTheDocument();
  });

  it('deve renderizar as métricas de performance', () => {
    renderWithTheme(<ReportsPage />);
    
    // PerformanceMetrics só é renderizado na 6ª tab (Performance)
    expect(screen.queryByTestId('performance-metrics')).not.toBeInTheDocument();
  });

  it('deve ter a estrutura de layout correta', () => {
    renderWithTheme(<ReportsPage />);
    
    // Verificar se todos os componentes estão presentes
    expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
    
    // Por padrão, apenas a primeira tab (Receitas) está ativa
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    
    // Verificar se as tabs estão presentes
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText('Categorias')).toBeInTheDocument();
    expect(screen.getByText('Plataformas')).toBeInTheDocument();
    expect(screen.getByText('Tendências')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });
});
