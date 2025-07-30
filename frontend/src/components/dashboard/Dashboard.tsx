'use client'

import React from 'react'
import {
  Box,
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Divider,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  DirectionsCar,
  Schedule,
  AttachMoney,
  AddCircle,
  Visibility,
  Edit,
  PlayArrow,
  Stop,
} from '@mui/icons-material'
import { useApp } from '../../store/context'

// Mock data - será substituído por dados reais da API
const mockDashboardData = {
  today: {
    income: 287.50,
    expenses: 95.20,
    profit: 192.30,
    trips: 14,
    hours: 8.5,
    efficiency: 85,
  },
  thisWeek: {
    income: 1420.30,
    expenses: 456.80,
    profit: 963.50,
    trips: 73,
    hours: 42,
  },
  goals: {
    dailyTarget: 250,
    weeklyTarget: 1750,
    weeklyKmTarget: 500,
  },
  recentTransactions: [
    {
      id: 1,
      type: 'income' as const,
      amount: 34.50,
      description: 'Corrida Centro → Aeroporto',
      category: 'Uber',
      time: '16:45',
      platform: 'Uber',
    },
    {
      id: 2,
      type: 'income' as const,
      amount: 28.90,
      description: 'Viagem Zona Sul',
      category: '99',
      time: '15:30',
      platform: '99',
    },
    {
      id: 3,
      type: 'expense' as const,
      amount: 85.00,
      description: 'Abastecimento Completo',
      category: 'Combustível',
      time: '14:30',
    },
  ],
}

export default function Dashboard() {
  const { state } = useApp()
  const { user } = state
  
  const [isWorkSessionActive, setIsWorkSessionActive] = React.useState(false)
  const [sessionDuration, setSessionDuration] = React.useState(0)

  const data = mockDashboardData

  // Calcular progresso das metas
  const dailyProgress = (data.today.income / data.goals.dailyTarget) * 100
  const weeklyProgress = (data.thisWeek.income / data.goals.weeklyTarget) * 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const stats = [
    {
      label: 'Ganhos Hoje',
      value: formatCurrency(data.today.income),
      icon: TrendingUp,
      color: 'success.main',
      bgColor: 'success.light',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Gastos Hoje',
      value: formatCurrency(data.today.expenses),
      icon: TrendingDown,
      color: 'error.main',
      bgColor: 'error.light',
      trend: '-8.2%',
      trendUp: false,
    },
    {
      label: 'Corridas',
      value: data.today.trips.toString(),
      icon: DirectionsCar,
      color: 'primary.main',
      bgColor: 'primary.light',
      trend: '+3',
      trendUp: true,
    },
    {
      label: 'Horas Online',
      value: `${data.today.hours}h`,
      icon: Schedule,
      color: 'warning.main',
      bgColor: 'warning.light',
      trend: '+1.5h',
      trendUp: true,
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Bem-vindo de volta, {user?.fullName?.split(' ')[0] || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Acompanhe seus ganhos em tempo real e gerencie sua jornada
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Grid xs={12} sm={6} md={3} key={stat.label}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: stat.bgColor,
                        color: stat.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      <Icon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={stat.trend}
                    size="small"
                    sx={{
                      backgroundColor: stat.trendUp ? 'success.light' : 'error.light',
                      color: stat.trendUp ? 'success.dark' : 'error.dark',
                      fontWeight: 600,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Session Control */}
        <Grid xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Controle de Sessão
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                {isWorkSessionActive ? 'Sessão ativa' : 'Pronto para trabalhar?'}
              </Typography>
              
              {isWorkSessionActive ? (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h3" fontWeight={700}>
                    {Math.floor(sessionDuration / 3600).toString().padStart(2, '0')}:
                    {Math.floor((sessionDuration % 3600) / 60).toString().padStart(2, '0')}:
                    {(sessionDuration % 60).toString().padStart(2, '0')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tempo de trabalho
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    Inicie sua sessão e acompanhe o tempo
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                startIcon={isWorkSessionActive ? <Stop /> : <PlayArrow />}
                onClick={() => setIsWorkSessionActive(!isWorkSessionActive)}
                sx={{
                  backgroundColor: isWorkSessionActive ? 'error.main' : 'success.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: isWorkSessionActive ? 'error.dark' : 'success.dark',
                  },
                }}
              >
                {isWorkSessionActive ? 'Parar Sessão' : 'Iniciar Sessão'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Goals Progress */}
        <Grid xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Progresso das Metas
                </Typography>
                <IconButton size="small">
                  <Edit />
                </IconButton>
              </Box>

              <Grid container spacing={3}>
                {/* Daily Goal */}
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'success.light',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'success.main',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="success.dark" fontWeight={600}>
                        Meta Diária
                      </Typography>
                      <Typography variant="body2" color="success.dark" fontWeight={600}>
                        {Math.round(dailyProgress)}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="success.dark">
                        {formatCurrency(data.today.income)}
                      </Typography>
                      <Typography variant="h6" color="success.dark">
                        {formatCurrency(data.goals.dailyTarget)}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(dailyProgress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'success.lighter',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'success.main',
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Weekly Goal */}
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'primary.light',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="primary.dark" fontWeight={600}>
                        Meta Semanal
                      </Typography>
                      <Typography variant="body2" color="primary.dark" fontWeight={600}>
                        {Math.round(weeklyProgress)}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="primary.dark">
                        {formatCurrency(data.thisWeek.income)}
                      </Typography>
                      <Typography variant="h6" color="primary.dark">
                        {formatCurrency(data.goals.weeklyTarget)}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(weeklyProgress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'primary.lighter',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'primary.main',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Atividade Recente
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddCircle />}
                    size="small"
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    size="small"
                  >
                    Ver Todas
                  </Button>
                </Box>
              </Box>

              {data.recentTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AttachMoney sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Nenhuma transação ainda
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Registre sua primeira transação para ver as atividades aqui
                  </Typography>
                  <Button variant="contained" startIcon={<AddCircle />}>
                    Adicionar Transação
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.recentTransactions.map((transaction, index) => (
                    <Box key={transaction.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: transaction.type === 'income' ? 'success.light' : 'error.light',
                            color: transaction.type === 'income' ? 'success.dark' : 'error.dark',
                          }}
                        >
                          {transaction.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {transaction.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.category} • {transaction.time}
                          </Typography>
                        </Box>
                        
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                      
                      {index < data.recentTransactions.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
