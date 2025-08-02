'use client'

import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface RevenueChartProps {
  period: string
}

export default function RevenueChart({ period }: RevenueChartProps) {
  const theme = useTheme()

  // Mock data para demonstração
  const data = [
    { name: 'Seg', value: 145.50 },
    { name: 'Ter', value: 189.30 },
    { name: 'Qua', value: 167.80 },
    { name: 'Qui', value: 234.20 },
    { name: 'Sex', value: 298.50 },
    { name: 'Sáb', value: 345.70 },
    { name: 'Dom', value: 267.90 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Receitas por dia da semana - {period === 'week' ? 'Esta semana' : 'Média semanal'}
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="name" 
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
              labelStyle={{ color: theme.palette.text.primary }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={theme.palette.success.main}
              fill={theme.palette.success.main}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total da Semana
          </Typography>
          <Typography variant="h6" color="success.main" fontWeight="bold">
            {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Média Diária
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {formatCurrency(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
