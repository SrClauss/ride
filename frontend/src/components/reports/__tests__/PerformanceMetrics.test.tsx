import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PerformanceMetrics from '../PerformanceMetrics';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PerformanceMetrics', () => {
  const defaultProps = {
    period: 'monthly'
  };

  it('deve renderizar o título das métricas', () => {
    renderWithTheme(<PerformanceMetrics {...defaultProps} />);
    
    expect(screen.getByText(/Métricas de performance e eficiência/)).toBeInTheDocument();
  });

  it('deve renderizar todas as métricas de performance', () => {
    renderWithTheme(<PerformanceMetrics {...defaultProps} />);
    
    // Verificar se as métricas estão presentes
    expect(screen.getByText('Eficiência Geral')).toBeInTheDocument();
    expect(screen.getByText('Horas/Dia (Média)')).toBeInTheDocument();
    expect(screen.getByText('Consumo Médio')).toBeInTheDocument();
    expect(screen.getByText('Tempo Médio')).toBeInTheDocument();
    expect(screen.getByText('Taxa de Aceitação')).toBeInTheDocument();
    expect(screen.getByText('Avaliação Média')).toBeInTheDocument();
  });

  it('deve exibir valores das métricas', () => {
    renderWithTheme(<PerformanceMetrics {...defaultProps} />);
    
    // Verificar valores mock
    expect(screen.getByText('87.5%')).toBeInTheDocument();
    expect(screen.getByText('8.2h')).toBeInTheDocument();
    expect(screen.getByText('12.8 km/L')).toBeInTheDocument();
    expect(screen.getByText('18.5 min')).toBeInTheDocument();
    expect(screen.getByText('94.2%')).toBeInTheDocument();
    expect(screen.getByText('4.8/5')).toBeInTheDocument();
  });

  it('deve renderizar as metas mensais', () => {
    renderWithTheme(<PerformanceMetrics {...defaultProps} />);
    
    // Verificar se as metas estão presentes
    expect(screen.getByText('Progresso das Metas Mensais')).toBeInTheDocument();
    expect(screen.getByText('Meta de Receita')).toBeInTheDocument();
    expect(screen.getByText('Meta de Corridas')).toBeInTheDocument();
    expect(screen.getByText('Controle de Gastos')).toBeInTheDocument();
  });

  it('deve renderizar valores das metas', () => {
    renderWithTheme(<PerformanceMetrics {...defaultProps} />);
    
    // Verificar valores das metas
    expect(screen.getByText('R$ 3.245,50 / R$ 4.000,00')).toBeInTheDocument();
    expect(screen.getByText('89 / 100')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.234,20 / R$ 1.200,00')).toBeInTheDocument();
  });

  it('deve renderizar dicas de melhoria', () => {
    renderWithTheme(<PerformanceMetrics {...defaultProps} />);
    
    expect(screen.getByText('💡 Dicas para Melhorar Performance')).toBeInTheDocument();
    expect(screen.getByText(/Continue mantendo um bom relacionamento com os clientes/)).toBeInTheDocument();
  });
});
