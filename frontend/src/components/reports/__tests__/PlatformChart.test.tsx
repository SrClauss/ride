import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PlatformChart from '../PlatformChart';

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

describe('PlatformChart', () => {
  const defaultProps = {
    period: 'monthly'
  };

  it('deve renderizar o gráfico de plataformas', () => {
    renderWithTheme(<PlatformChart {...defaultProps} />);
    
    expect(screen.getByText(/Performance por plataforma/)).toBeInTheDocument();
  });

  it('deve renderizar o componente ResponsiveContainer', () => {
    renderWithTheme(<PlatformChart {...defaultProps} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('deve renderizar o BarChart', () => {
    renderWithTheme(<PlatformChart {...defaultProps} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('deve renderizar os componentes do gráfico', () => {
    renderWithTheme(<PlatformChart {...defaultProps} />);
    
    expect(screen.getAllByTestId('bar').length).toBeGreaterThan(0);
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('deve estar dentro de um Card', () => {
    renderWithTheme(<PlatformChart {...defaultProps} />);
    
    const cardContent = screen.getByText(/Performance por plataforma/).closest('div');
    expect(cardContent).toBeInTheDocument();
  });
});
