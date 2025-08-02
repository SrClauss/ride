'use client'

import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface TrendChartProps {
  period: string
}

export default function TrendChart({ period }: TrendChartProps) {
  const theme = useTheme()

  // Mock data para demonstração
  const data = [
    { month: 'Jan', receita: 3245.50, gastos: 1234.20, corridas: 89 },
    { month: 'Fev', receita: 3567.30, gastos: 1345.60, corridas: 95 },
    { month: 'Mar', receita: 4123.80, gastos: 1456.80, corridas: 112 },
    { month: 'Abr', receita: 3789.20, gastos: 1298.40, corridas: 103 },
    { month: 'Mai', receita: 4456.90, gastos: 1567.20, corridas: 125 },
    { month: 'Jun', receita: 4234.50, gastos: 1445.30, corridas: 118 },
    { month: 'Jul', receita: 3227.70, gastos: 1156.40, corridas: 92 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const calcularTendencia = (values: number[]) => {
    if (values.length < 2) return 0
    const first = values[0]
    const last = values[values.length - 1]
    return ((last - first) / first) * 100
  }

  const receitaValues = data.map(d => d.receita)
  const gastosValues = data.map(d => d.gastos)
  const corridasValues = data.map(d => d.corridas)

  const tendenciaReceita = calcularTendencia(receitaValues)
  const tendenciaGastos = calcularTendencia(gastosValues)
  const tendenciaCorridas = calcularTendencia(corridasValues)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Evolução temporal das métricas principais - Últimos 7 meses
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'corridas' ? `${value} corridas` : formatCurrency(value), 
                name === 'receita' ? 'Receita' : name === 'gastos' ? 'Gastos' : 'Corridas'
              ]}
              labelStyle={{ color: theme.palette.text.primary }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="receita"
              stroke={theme.palette.success.main}
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Receita"
            />
            <Line
              type="monotone"
              dataKey="gastos"
              stroke={theme.palette.error.main}
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Gastos"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Análise de Tendências */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Análise de Tendências
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2 
        }}>
          {/* Tendência Receita */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 12px)' },
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Receita
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              color={tendenciaReceita >= 0 ? 'success.main' : 'error.main'}
            >
              {tendenciaReceita >= 0 ? '+' : ''}{tendenciaReceita.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tendenciaReceita >= 0 ? 'Crescimento' : 'Queda'} nos últimos meses
            </Typography>
          </Box>

          {/* Tendência Gastos */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 12px)' },
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Gastos
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              color={tendenciaGastos <= 0 ? 'success.main' : 'error.main'}
            >
              {tendenciaGastos >= 0 ? '+' : ''}{tendenciaGastos.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tendenciaGastos >= 0 ? 'Aumento' : 'Redução'} nos gastos
            </Typography>
          </Box>

          {/* Tendência Corridas */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 12px)' },
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Corridas
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              color={tendenciaCorridas >= 0 ? 'success.main' : 'error.main'}
            >
              {tendenciaCorridas >= 0 ? '+' : ''}{tendenciaCorridas.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tendenciaCorridas >= 0 ? 'Aumento' : 'Queda'} no volume
            </Typography>
          </Box>
        </Box>

        {/* Insights */}
        <Box sx={{ 
          mt: 3,
          p: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            💡 Insights da Análise
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              • {tendenciaReceita >= 0 ? 'Receita em crescimento' : 'Receita em queda'} de {Math.abs(tendenciaReceita).toFixed(1)}% no período
            </Typography>
            <Typography variant="body2">
              • {tendenciaGastos <= 0 ? 'Boa gestão de custos' : 'Atenção aos gastos crescentes'} ({Math.abs(tendenciaGastos).toFixed(1)}%)
            </Typography>
            <Typography variant="body2">
              • Volume de corridas {tendenciaCorridas >= 0 ? 'aumentou' : 'diminuiu'} {Math.abs(tendenciaCorridas).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
