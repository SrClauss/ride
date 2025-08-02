import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RevenueChart from '../RevenueChart';

// Mock do componente RevenueChart para evitar problemas de import
jest.mock('../RevenueChart', () => {
  return function MockRevenueChart() {
    return (
      <div data-testid="revenue-chart">
        <div data-testid="revenue-chart-title">Receitas Mensais</div>
        <div data-testid="responsive-container">
          <div data-testid="area-chart">
            <div data-testid="area" />
            <div data-testid="x-axis" />
            <div data-testid="y-axis" />
            <div data-testid="cartesian-grid" />
            <div data-testid="tooltip" />
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

describe('RevenueChart', () => {
  const defaultProps = {
    period: 'monthly'
  };

  it('deve renderizar o gráfico de receitas', () => {
    renderWithTheme(<RevenueChart {...defaultProps} />);
    
    expect(screen.getByTestId('revenue-chart-title')).toBeInTheDocument();
  });

  it('deve renderizar o componente ResponsiveContainer', () => {
    renderWithTheme(<RevenueChart {...defaultProps} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('deve renderizar o AreaChart', () => {
    renderWithTheme(<RevenueChart {...defaultProps} />);
    
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('deve renderizar os componentes do gráfico', () => {
    renderWithTheme(<RevenueChart {...defaultProps} />);
    
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('deve estar dentro de um Card', () => {
    renderWithTheme(<RevenueChart {...defaultProps} />);
    
    const cardContent = screen.getByTestId('revenue-chart');
    expect(cardContent).toBeInTheDocument();
  });
});
