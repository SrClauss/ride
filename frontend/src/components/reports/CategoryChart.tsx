'use client'

import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts'

interface CategoryChartProps {
  period: string
}

export default function CategoryChart({ period }: CategoryChartProps) {
  const theme = useTheme()

  // Mock data para demonstração
  const data = [
    { name: 'Uber', value: 1245.50, color: theme.palette.primary.main },
    { name: 'iFood', value: 856.30, color: theme.palette.secondary.main },
    { name: 'InDriver', value: 423.80, color: theme.palette.success.main },
    { name: '99', value: 567.20, color: theme.palette.warning.main },
    { name: 'Outros', value: 134.90, color: theme.palette.info.main },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0)

  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload
      return (
        <Box sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          p: 1.5
        }}>
          <Typography variant="body2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(data.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {((data.value / totalRevenue) * 100).toFixed(1)}% do total
          </Typography>
        </Box>
      )
    }
    return null
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Distribuição de receitas por plataforma - {period === 'month' ? 'Este mês' : 'No período'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Gráfico de Pizza */}
        <Box sx={{ flex: 1, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Lista de Categorias */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Detalhamento por Plataforma
          </Typography>
          
          {data.map((item, index) => (
            <Box key={index} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: item.color,
                    borderRadius: 1 
                  }} 
                />
                <Typography variant="body2" fontWeight="500">
                  {item.name}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(item.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((item.value / totalRevenue) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          ))}
          
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 1 
          }}>
            <Typography variant="body2">
              Total Geral
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatCurrency(totalRevenue)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
