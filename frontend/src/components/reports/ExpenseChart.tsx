'use client'

import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface ExpenseChartProps {
  period: string
}

export default function ExpenseChart({ period }: ExpenseChartProps) {
  const theme = useTheme()

  // Mock data para demonstração
  const data = [
    { category: 'Combustível', value: 485.50 },
    { category: 'Manutenção', value: 230.00 },
    { category: 'Seguro', value: 150.00 },
    { category: 'Documentação', value: 85.00 },
    { category: 'Limpeza', value: 45.00 },
    { category: 'Outros', value: 120.30 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Despesas por categoria - {period === 'month' ? 'Este mês' : 'No período'}
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="category" 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Gasto']}
              labelStyle={{ color: theme.palette.text.primary }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius
              }}
            />
            <Bar
              dataKey="value"
              fill={theme.palette.error.main}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: theme.palette.error.main,
                  borderRadius: 1 
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                {item.category}: {formatCurrency(item.value)} 
                ({((item.value / totalExpenses) * 100).toFixed(1)}%)
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total de Despesas
            </Typography>
            <Typography variant="h6" color="error.main" fontWeight="bold">
              {formatCurrency(totalExpenses)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Maior Categoria
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {data[0].category}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
