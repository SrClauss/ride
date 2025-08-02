import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SummaryCards from '../SummaryCards';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SummaryCards', () => {
  const defaultProps = {
    period: 'monthly'
  };

  it('deve renderizar todos os cards de resumo', () => {
    renderWithTheme(<SummaryCards {...defaultProps} />);
    
    // Verificar se os cards principais estão presentes
    expect(screen.getByText('Receita Total')).toBeInTheDocument();
    expect(screen.getByText('Despesas Totais')).toBeInTheDocument();
    expect(screen.getByText('Lucro Líquido')).toBeInTheDocument();
    expect(screen.getByText('Total de Corridas')).toBeInTheDocument(); // Corrigido: era "Transações"
  });

  it('deve exibir valores calculados', () => {
    renderWithTheme(<SummaryCards {...defaultProps} />);
    
    // Verificar valores calculados dos dados mockados
    expect(screen.getByText('R$ 107,20')).toBeInTheDocument(); // Receita total
    expect(screen.getByText('R$ 95,50')).toBeInTheDocument();  // Despesas totais
    expect(screen.getByText('R$ 11,70')).toBeInTheDocument();  // Lucro líquido
    expect(screen.getByText('3')).toBeInTheDocument();         // Total de corridas
  });

  it('deve exibir percentuais de crescimento', () => {
    renderWithTheme(<SummaryCards {...defaultProps} />);
    
    // Verificar se os percentuais estão presentes (formato: "12.5% vs período anterior")
    expect(screen.getByText(/12\.5.*%/)).toBeInTheDocument();
    expect(screen.getByText(/3\.2.*%/)).toBeInTheDocument();
    expect(screen.getByText(/8\.7.*%/)).toBeInTheDocument();
    expect(screen.getByText(/5\.3.*%/)).toBeInTheDocument();
  });

  it('deve ter os ícones corretos', () => {
    renderWithTheme(<SummaryCards {...defaultProps} />);
    
    // Os ícones são renderizados como SVG com data-testid
    expect(screen.getByTestId('AttachMoneyIcon')).toBeInTheDocument();
    expect(screen.getByTestId('LocalGasStationIcon')).toBeInTheDocument();
    // Usar getAllByTestId para ícones que podem aparecer múltiplas vezes
    expect(screen.getAllByTestId('TrendingUpIcon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('DirectionsCarIcon').length).toBeGreaterThan(0);
  });

  it('deve ter layout responsivo', () => {
    renderWithTheme(<SummaryCards {...defaultProps} />);
    
    // Verificar se todos os cards estão renderizados
    const cards = screen.getAllByRole('heading');
    expect(cards.length).toBeGreaterThan(0);
    
    // Verificar se o container Box está presente
    const container = screen.getByText('Receita Total').closest('[class*="MuiBox-root"]');
    expect(container).toBeInTheDocument();
  });
});
