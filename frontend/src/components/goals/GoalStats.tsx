'use client'

import React from 'react'
import {
  Paper,
  Stack,
  Box,
  Typography,
  LinearProgress,
  Chip,
  useTheme
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material'
import { Goal, calculateGoalStatistics, formatCurrency } from '../../utils/goalUtils'

interface GoalStatsProps {
  goals: Goal[]
}

export default function GoalStats({ goals }: GoalStatsProps) {
  const theme = useTheme()
  const stats = calculateGoalStatistics(goals)

  const statCards = [
    {
      title: 'Total de Metas',
      value: stats.total,
      icon: <TrendingUpIcon />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + '20'
    },
    {
      title: 'Ativas',
      value: stats.active,
      icon: <TrendingUpIcon />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + '20'
    },
    {
      title: 'Concluídas',
      value: stats.completed,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + '20'
    },
    {
      title: 'Pausadas',
      value: stats.paused,
      icon: <PauseIcon />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + '20'
    },
    {
      title: 'Expiradas',
      value: stats.expired,
      icon: <ErrorIcon />,
      color: theme.palette.error.main,
      bgColor: theme.palette.error.light + '20'
    }
  ]

  if (stats.total === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Nenhuma meta cadastrada ainda
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Comece criando sua primeira meta financeira
        </Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={3}>
      {/* Cards de Estatísticas */}
      <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
        {statCards.map((stat) => (
          <Paper
            key={stat.title}
            sx={{
              p: 2,
              minWidth: 140,
              textAlign: 'center',
              background: stat.bgColor,
              border: `1px solid ${stat.color}20`
            }}
          >
            <Box sx={{ color: stat.color, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: stat.color }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stat.title}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* Estatísticas Detalhadas */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumo Geral
        </Typography>
        
        <Stack spacing={3}>
          {/* Taxa de Conclusão */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Taxa de Conclusão
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {stats.completionRate.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={stats.completionRate} 
              sx={{ height: 8, borderRadius: 4 }}
              color="success"
            />
          </Box>

          {/* Progresso Médio das Ativas */}
          {stats.active > 0 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progresso Médio (Ativas)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {stats.averageProgress.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={stats.averageProgress} 
                sx={{ height: 8, borderRadius: 4 }}
                color="primary"
              />
            </Box>
          )}

          {/* Valores */}
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <MoneyIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Valor Total das Metas
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(stats.totalValue)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Valor Conquistado
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {formatCurrency(stats.achievedValue)}
              </Typography>
            </Box>
          </Stack>

          {/* Alertas */}
          {stats.nearDeadline > 0 && (
            <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, border: '1px solid', borderColor: 'warning.main' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTimeIcon color="warning" />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {stats.nearDeadline} meta{stats.nearDeadline > 1 ? 's' : ''} próxima{stats.nearDeadline > 1 ? 's' : ''} do prazo
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Vencimento em 30 dias ou menos
              </Typography>
            </Box>
          )}

          {/* Status Distribution */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribuição por Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {stats.active > 0 && (
                <Chip 
                  label={`${stats.active} Ativa${stats.active > 1 ? 's' : ''}`} 
                  color="primary" 
                  size="small" 
                />
              )}
              {stats.completed > 0 && (
                <Chip 
                  label={`${stats.completed} Concluída${stats.completed > 1 ? 's' : ''}`} 
                  color="success" 
                  size="small" 
                />
              )}
              {stats.paused > 0 && (
                <Chip 
                  label={`${stats.paused} Pausada${stats.paused > 1 ? 's' : ''}`} 
                  color="warning" 
                  size="small" 
                />
              )}
              {stats.expired > 0 && (
                <Chip 
                  label={`${stats.expired} Expirada${stats.expired > 1 ? 's' : ''}`} 
                  color="error" 
                  size="small" 
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  )
}
