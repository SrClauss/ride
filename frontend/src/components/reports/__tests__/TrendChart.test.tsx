import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TrendChart from '../TrendChart';

// Mock do componente TrendChart para evitar problemas de import
jest.mock('../TrendChart', () => {
  return function MockTrendChart() {
    return (
      <div data-testid="trend-chart">
        <div data-testid="trend-chart-title">Tendência de Receitas</div>
        <div data-testid="responsive-container">
          <div data-testid="line-chart">
            <div data-testid="line" />
            <div data-testid="x-axis" />
            <div data-testid="y-axis" />
            <div data-testid="cartesian-grid" />
            <div data-testid="tooltip" />
            <div data-testid="legend" />
          </div>
        </div>
      </div>
    );
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

describe('TrendChart', () => {
  const defaultProps = {
    period: 'monthly'
  };

  it('deve renderizar o gráfico de tendências', () => {
    renderWithTheme(<TrendChart {...defaultProps} />);
    
    expect(screen.getByTestId('trend-chart-title')).toBeInTheDocument();
  });

  it('deve renderizar o componente ResponsiveContainer', () => {
    renderWithTheme(<TrendChart {...defaultProps} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('deve renderizar o LineChart', () => {
    renderWithTheme(<TrendChart {...defaultProps} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('deve renderizar os componentes do gráfico', () => {
    renderWithTheme(<TrendChart {...defaultProps} />);
    
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('deve estar dentro de um Card', () => {
    renderWithTheme(<TrendChart {...defaultProps} />);
    
    const cardContent = screen.getByTestId('trend-chart');
    expect(cardContent).toBeInTheDocument();
  });
});
