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
  ResponsiveContainer,
  Legend
} from 'recharts'

interface PlatformChartProps {
  period: string
}

export default function PlatformChart({ period }: PlatformChartProps) {
  const theme = useTheme()

  // Mock data para demonstração
  const data = [
    { platform: 'Uber', corridas: 45, receita: 1245.50, gastos: 235.20 },
    { platform: 'iFood', corridas: 32, receita: 856.30, gastos: 178.40 },
    { platform: 'InDriver', corridas: 28, receita: 423.80, gastos: 125.60 },
    { platform: '99', corridas: 35, receita: 567.20, gastos: 189.30 },
    { platform: 'Outros', corridas: 12, receita: 134.90, gastos: 45.80 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalCorridas = data.reduce((sum, item) => sum + item.corridas, 0)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Performance por plataforma - {period === 'month' ? 'Este mês' : 'No período'}
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="platform" 
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
            <Bar
              dataKey="receita"
              fill={theme.palette.success.main}
              name="Receita"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="gastos"
              fill={theme.palette.error.main}
              name="Gastos"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Resumo por Plataforma */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Resumo por Plataforma
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2 
        }}>
          {data.map((item, index) => {
            const lucro = item.receita - item.gastos
            const mediaPorCorrida = item.corridas > 0 ? item.receita / item.corridas : 0
            
            return (
              <Box 
                key={index} 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' },
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  minWidth: 0
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  {item.platform}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Corridas:
                    </Typography>
                    <Typography variant="caption" fontWeight="500">
                      {item.corridas} ({((item.corridas / totalCorridas) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Receita:
                    </Typography>
                    <Typography variant="caption" fontWeight="500" color="success.main">
                      {formatCurrency(item.receita)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Gastos:
                    </Typography>
                    <Typography variant="caption" fontWeight="500" color="error.main">
                      {formatCurrency(item.gastos)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Lucro:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      fontWeight="bold" 
                      color={lucro >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(lucro)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Média/Corrida:
                    </Typography>
                    <Typography variant="caption" fontWeight="500">
                      {formatCurrency(mediaPorCorrida)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
