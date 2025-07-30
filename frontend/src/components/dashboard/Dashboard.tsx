'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
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
import { useDashboardData } from '../../hooks/useDashboardApi'
import { useTransactionsData } from '../../hooks/useTransactionsApi'
import { Transaction } from '../../hooks/useTransactionsApi'
import { getCurrentDataSource } from '../../services/dataService'

const Dashboard: React.FC = () => {
  const { state } = useApp()
  const { user } = state
  
  const [isWorkSessionActive, setIsWorkSessionActive] = React.useState(false)
  const [sessionDuration] = React.useState(0)

  // Buscar dados reais da API ou mocks
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardData()
  const { 
    transactions: recentTransactions
  } = useTransactionsData(1, 5) // Últimas 5 transações

  // Debug: mostrar fonte dos dados
  React.useEffect(() => {
    const dataSource = getCurrentDataSource()
    console.log(`🔧 Dashboard usando dados: ${dataSource.toUpperCase()}`)
  }, [])

  // Usar dados da API/mock - estrutura compatível
  const data = React.useMemo(() => {
    if (dashboardData) {
      return {
        userName: user?.fullName || user?.username || 'Usuário',
        userEmail: user?.email || 'usuario@exemplo.com',
        today: {
          income: dashboardData.ganhos_hoje || 0,
          expenses: dashboardData.gastos_hoje || 0,
          profit: (dashboardData.ganhos_hoje || 0) - (dashboardData.gastos_hoje || 0),
          trips: dashboardData.corridas_hoje || 0,
          hours: dashboardData.horas_hoje || 0,
          efficiency: dashboardData.eficiencia || 0,
        },
        thisWeek: {
          income: dashboardData.ganhos_semana || 0,
          expenses: dashboardData.gastos_semana || 0,
          profit: (dashboardData.ganhos_semana || 0) - (dashboardData.gastos_semana || 0),
          trips: dashboardData.corridas_semana || 0,
          hours: dashboardData.horas_semana || 0,
        },
        goals: {
          dailyTarget: dashboardData.meta_diaria || 250,
          weeklyTarget: dashboardData.meta_semanal || 1750,
          weeklyKmTarget: 500,
        },
        recentTransactions: recentTransactions || [],
        trends: {
          income: dashboardData.tendencia_ganhos || 0,
          expenses: dashboardData.tendencia_gastos || 0,
          rides: dashboardData.tendencia_corridas || 0,
        }
      }
    }

    // Fallback - não deveria chegar aqui com a nova estrutura
    return {
      userName: user?.fullName || user?.username || 'Usuário',
      userEmail: user?.email || 'usuario@exemplo.com',
      today: { income: 0, expenses: 0, profit: 0, trips: 0, hours: 0, efficiency: 0 },
      thisWeek: { income: 0, expenses: 0, profit: 0, trips: 0, hours: 0 },
      goals: { dailyTarget: 250, weeklyTarget: 1750, weeklyKmTarget: 500 },
      recentTransactions: [],
      trends: { income: 0, expenses: 0, rides: 0 }
    }
  }, [dashboardData, user, recentTransactions])

  // Loading state
  if (dashboardLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Carregando dados do dashboard...
        </Typography>
      </Box>
    )
  }

  // Error state
  if (dashboardError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {dashboardError}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Verificar se o backend está rodando e as configurações de API estão corretas.
        </Typography>
      </Box>
    )
  }

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
      trend: `${data.trends.income > 0 ? '+' : ''}${data.trends.income.toFixed(1)}%`,
      trendUp: data.trends.income > 0,
    },
    {
      label: 'Gastos Hoje',
      value: formatCurrency(data.today.expenses),
      icon: TrendingDown,
      color: 'error.main',
      bgColor: 'error.light',
      trend: `${data.trends.expenses > 0 ? '+' : ''}${data.trends.expenses.toFixed(1)}%`,
      trendUp: data.trends.expenses < 0, // Menor gasto é bom
    },
    {
      label: 'Corridas',
      value: data.today.trips.toString(),
      icon: DirectionsCar,
      color: 'primary.main',
      bgColor: 'primary.light',
      trend: `${data.trends.rides > 0 ? '+' : ''}${data.trends.rides.toFixed(1)}%`,
      trendUp: data.trends.rides > 0,
    },
    {
      label: 'Horas Online',
      value: `${data.today.hours}h`,
      icon: Schedule,
      color: 'warning.main',
      bgColor: 'warning.light',
      trend: `+${data.today.hours > 0 ? (data.today.hours * 0.1).toFixed(1) : 0}h`,
      trendUp: true,
    },
  ]

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Welcome Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            Bem-vindo de volta, {data.userName?.split(' ')[0] || 'Usuário'}!
          </Typography>
          <Chip
            label={getCurrentDataSource() === 'mock' ? 'DADOS MOCK' : 'DADOS REAIS'}
            size="small"
            color={getCurrentDataSource() === 'mock' ? 'warning' : 'success'}
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              display: { xs: 'none', sm: 'flex' }
            }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Acompanhe seus ganhos em tempo real e gerencie sua jornada
        </Typography>
        {getCurrentDataSource() === 'mock' && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontStyle: 'italic' }}>
            💡 Exibindo dados simulados. Configure NEXT_PUBLIC_USE_MOCK_DATA=api no .env.local para usar dados reais.
          </Typography>
        )}
      </Box>

      {/* Quick Stats */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: { xs: 2, md: 3 },
          mb: { xs: 3, md: 4 }
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
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
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.bgColor,
                      color: stat.color,
                      width: { xs: 40, md: 48 },
                      height: { xs: 40, md: 48 },
                      mr: 2,
                    }}
                  >
                    <Icon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                    >
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
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                />
              </CardContent>
            </Card>
          )
        })}
      </Box>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 2fr'
          },
          gap: { xs: 2, md: 3 },
          mb: { xs: 3, md: 4 }
        }}
      >
        {/* Session Control */}
        <Box>
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
        </Box>

        {/* Goals Progress */}
        <Box>
        {/* Goals Progress */}
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Progresso das Metas
                </Typography>
                <IconButton size="small">
                  <Edit />
                </IconButton>
              </Box>

              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)'
                  },
                  gap: { xs: 2, sm: 3 }
                }}
              >
                {/* Daily Goal */}
                <Box>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1a2e1a' : '#f0f9f0',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? '#2e7d32' : '#4caf50',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{
                          color: (theme) => theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32'
                        }}
                      >
                        Meta Diária
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{
                          color: (theme) => theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32'
                        }}
                      >
                        {Math.round(dailyProgress)}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 2,
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          color: (theme) => theme.palette.mode === 'dark' ? '#c8e6c9' : '#1b5e20'
                        }}
                      >
                        {formatCurrency(data.today.income)}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          color: (theme) => theme.palette.mode === 'dark' ? '#c8e6c9' : '#1b5e20'
                        }}
                      >
                        {formatCurrency(data.goals.dailyTarget)}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(dailyProgress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2e4e2e' : '#e8f5e8',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32',
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Weekly Goal */}
                <Box>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1a237e' : '#e3f2fd',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? '#3f51b5' : '#1976d2',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{
                          color: (theme) => theme.palette.mode === 'dark' ? '#9fa8da' : '#1565c0'
                        }}
                      >
                        Meta Semanal
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{
                          color: (theme) => theme.palette.mode === 'dark' ? '#9fa8da' : '#1565c0'
                        }}
                      >
                        {Math.round(weeklyProgress)}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 2,
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          color: (theme) => theme.palette.mode === 'dark' ? '#c5cae9' : '#0d47a1'
                        }}
                      >
                        {formatCurrency(data.thisWeek.income)}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          color: (theme) => theme.palette.mode === 'dark' ? '#c5cae9' : '#0d47a1'
                        }}
                      >
                        {formatCurrency(data.goals.weeklyTarget)}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(weeklyProgress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#283593' : '#e1f5fe',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#3f51b5' : '#1976d2',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Transactions */}
      <Box>
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
                  {data.recentTransactions.map((transaction: Transaction, index: number) => (
                    <Box key={transaction.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: transaction.tipo === 'receita' ? 'success.light' : 'error.light',
                            color: transaction.tipo === 'receita' ? 'success.dark' : 'error.dark',
                          }}
                        >
                          {transaction.tipo === 'receita' ? <TrendingUp /> : <TrendingDown />}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {transaction.descricao}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.nome_categoria} • {new Date(transaction.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color={transaction.tipo === 'receita' ? 'success.main' : 'error.main'}
                        >
                          {transaction.tipo === 'receita' ? '+' : '-'}
                          {formatCurrency(transaction.valor)}
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
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard
