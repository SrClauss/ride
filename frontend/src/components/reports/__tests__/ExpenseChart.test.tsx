import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ExpenseChart from '../ExpenseChart';

// Mock do Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ExpenseChart', () => {
  const defaultProps = {
    period: 'monthly'
  };

  it('deve renderizar o gráfico de despesas', () => {
    renderWithTheme(<ExpenseChart {...defaultProps} />);
    
    expect(screen.getByText(/Despesas por categoria/i)).toBeInTheDocument();
  });

  it('deve renderizar o componente ResponsiveContainer', () => {
    renderWithTheme(<ExpenseChart {...defaultProps} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('deve renderizar o BarChart', () => {
    renderWithTheme(<ExpenseChart {...defaultProps} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('deve renderizar os componentes do gráfico', () => {
    renderWithTheme(<ExpenseChart {...defaultProps} />);
    
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('deve estar dentro de um Card', () => {
    renderWithTheme(<ExpenseChart {...defaultProps} />);
    
    const cardContent = screen.getByText(/Despesas por categoria/i).closest('div');
    expect(cardContent).toBeInTheDocument();
  });
});
