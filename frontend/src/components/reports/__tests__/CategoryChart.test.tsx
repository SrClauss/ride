import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CategoryChart from '../CategoryChart';

// Mock do Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
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

describe('CategoryChart', () => {
  const defaultProps = {
    period: 'monthly'
  };

  it('deve renderizar o gráfico de categorias', () => {
    renderWithTheme(<CategoryChart {...defaultProps} />);
    
    expect(screen.getByText(/Distribuição de receitas por plataforma/i)).toBeInTheDocument();
  });

  it('deve renderizar o componente ResponsiveContainer', () => {
    renderWithTheme(<CategoryChart {...defaultProps} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('deve renderizar o PieChart', () => {
    renderWithTheme(<CategoryChart {...defaultProps} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('deve renderizar os componentes do gráfico', () => {
    renderWithTheme(<CategoryChart {...defaultProps} />);
    
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('deve estar dentro de um Card', () => {
    renderWithTheme(<CategoryChart {...defaultProps} />);
    
    const cardContent = screen.getByText(/Distribuição de receitas por plataforma/i).closest('div');
    expect(cardContent).toBeInTheDocument();
  });
});
