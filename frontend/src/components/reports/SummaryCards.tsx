'use client'

import React from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Avatar,
  useTheme
} from '@mui/material'
import { 
  TrendingUp,
  TrendingDown,
  AttachMoney,
  LocalGasStation,
  DirectionsCar,
  Schedule
} from '@mui/icons-material'

interface SummaryCardsProps {
  period: string
}

interface SummaryCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'error' | 'warning' | 'info'
  trend?: {
    value: number
    isPositive: boolean
  }
}

function SummaryCard({ title, value, subtitle, icon, color, trend }: SummaryCardProps) {
  const theme = useTheme()
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend.isPositive ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: trend.isPositive ? 'success.main' : 'error.main',
                fontWeight: 500
              }}
            >
              {Math.abs(trend.value)}% vs período anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function SummaryCards({ period }: SummaryCardsProps) {
  // Mock data para demonstração - em produção viria de uma API
  const mockTransactions = [
    { id: 1, type: 'income', amount: 45.50 },
    { id: 2, type: 'income', amount: 32.80 },
    { id: 3, type: 'expense', amount: 80.00 },
    { id: 4, type: 'income', amount: 28.90 },
    { id: 5, type: 'expense', amount: 15.50 },
  ]

  // Calcular métricas baseadas nos dados mockados
  const metrics = React.useMemo(() => {
    const revenues = mockTransactions.filter(t => t.type === 'income')
    const expenses = mockTransactions.filter(t => t.type === 'expense')
    
    const totalRevenue = revenues.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const totalTrips = revenues.length
    const averagePerTrip = totalTrips > 0 ? totalRevenue / totalTrips : 0
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      averagePerTrip,
      totalTrips,
      averageHoursPerDay: 8.5
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const cards: SummaryCardProps[] = [
    {
      title: 'Receita Total',
      value: formatCurrency(metrics.totalRevenue),
      subtitle: `${metrics.totalTrips} corridas realizadas`,
      icon: <AttachMoney />,
      color: 'success',
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Despesas Totais',
      value: formatCurrency(metrics.totalExpenses),
      subtitle: 'Combustível, manutenção e outros',
      icon: <LocalGasStation />,
      color: 'error',
      trend: { value: 3.2, isPositive: false }
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(metrics.netProfit),
      subtitle: `Margem: ${metrics.totalRevenue > 0 ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) : 0}%`,
      icon: <TrendingUp />,
      color: metrics.netProfit >= 0 ? 'success' : 'error',
      trend: { value: 8.7, isPositive: metrics.netProfit >= 0 }
    },
    {
      title: 'Média por Corrida',
      value: formatCurrency(metrics.averagePerTrip),
      subtitle: 'Valor médio recebido por viagem',
      icon: <DirectionsCar />,
      color: 'primary',
      trend: { value: 5.3, isPositive: true }
    },
    {
      title: 'Total de Corridas',
      value: metrics.totalTrips.toString(),
      subtitle: `${period === 'month' ? 'Este mês' : 'No período'}`,
      icon: <DirectionsCar />,
      color: 'info',
      trend: { value: 15.2, isPositive: true }
    },
    {
      title: 'Horas/Dia (Média)',
      value: `${metrics.averageHoursPerDay}h`,
      subtitle: 'Tempo médio trabalhado por dia',
      icon: <Schedule />,
      color: 'warning',
      trend: { value: 2.1, isPositive: true }
    }
  ]

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 3,
      '& > *': {
        flex: {
          xs: '1 1 100%',
          sm: '1 1 calc(50% - 12px)',
          md: '1 1 calc(33.333% - 16px)'
        }
      }
    }}>
      {cards.map((card, index) => (
        <Box key={index} sx={{ minWidth: 0 }}>
          <SummaryCard {...card} />
        </Box>
      ))}
    </Box>
  )
}
