'use client'

import React from 'react'
import { Box, Typography, useTheme, Avatar } from '@mui/material'
import { 
  Speed,
  TrendingUp,
  AccessTime,
  LocalGasStation,
  EmojiEvents,
  Warning
} from '@mui/icons-material'

interface PerformanceMetricsProps {
  period: string
}

export default function PerformanceMetrics({ period }: PerformanceMetricsProps) {
  const theme = useTheme()

  // Mock data para demonstração
  const metrics = {
    eficiencia: 87.5, // % de eficiência geral
    mediaHorasDiarias: 8.2,
    kmPorLitro: 12.8,
    tempoMedioEntregas: 18.5, // minutos
    taxaAceitacao: 94.2, // %
    avaliacaoMedia: 4.8,
    metasMensais: {
      receita: { atual: 3245.50, meta: 4000.00 },
      corridas: { atual: 89, meta: 100 },
      gastos: { atual: 1234.20, meta: 1200.00 }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return theme.palette.success.main
    if (percentage >= 80) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const performanceCards = [
    {
      title: 'Eficiência Geral',
      value: `${metrics.eficiencia}%`,
      icon: <Speed />,
      color: metrics.eficiencia >= 85 ? 'success' : metrics.eficiencia >= 70 ? 'warning' : 'error',
      description: 'Baseado em tempo, consumo e satisfação'
    },
    {
      title: 'Horas/Dia (Média)',
      value: `${metrics.mediaHorasDiarias}h`,
      icon: <AccessTime />,
      color: 'primary',
      description: 'Tempo médio trabalhado por dia'
    },
    {
      title: 'Consumo Médio',
      value: `${metrics.kmPorLitro} km/L`,
      icon: <LocalGasStation />,
      color: metrics.kmPorLitro >= 12 ? 'success' : 'warning',
      description: 'Quilometragem por litro de combustível'
    },
    {
      title: 'Tempo Médio',
      value: `${metrics.tempoMedioEntregas} min`,
      icon: <AccessTime />,
      color: metrics.tempoMedioEntregas <= 20 ? 'success' : 'warning',
      description: 'Tempo médio por entrega/corrida'
    },
    {
      title: 'Taxa de Aceitação',
      value: `${metrics.taxaAceitacao}%`,
      icon: <TrendingUp />,
      color: metrics.taxaAceitacao >= 90 ? 'success' : 'warning',
      description: 'Pedidos aceitos vs oferecidos'
    },
    {
      title: 'Avaliação Média',
      value: `${metrics.avaliacaoMedia}/5`,
      icon: <EmojiEvents />,
      color: metrics.avaliacaoMedia >= 4.5 ? 'success' : 'warning',
      description: 'Nota média dos clientes'
    }
  ]

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Métricas de performance e eficiência - {period === 'month' ? 'Este mês' : 'No período'}
        </Typography>
      </Box>

      {/* Cards de Performance */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        mb: 4
      }}>
        {performanceCards.map((card, index) => (
          <Box 
            key={index}
            sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 12px)' },
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              minWidth: 0
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                sx={{
                  bgcolor: `${card.color}.main`,
                  width: 32,
                  height: 32,
                  mr: 1.5
                }}
              >
                {card.icon}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight="bold">
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {card.title}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {card.description}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Metas Mensais */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Progresso das Metas Mensais
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2 
        }}>
          {/* Meta de Receita */}
          <Box sx={{ 
            p: 3,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Meta de Receita
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(metrics.metasMensais.receita.atual)} / {formatCurrency(metrics.metasMensais.receita.meta)}
              </Typography>
            </Box>
            <Box sx={{ 
              height: 8, 
              bgcolor: 'grey.200', 
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                height: '100%', 
                width: `${Math.min((metrics.metasMensais.receita.atual / metrics.metasMensais.receita.meta) * 100, 100)}%`,
                bgcolor: getProgressColor(metrics.metasMensais.receita.atual, metrics.metasMensais.receita.meta),
                transition: 'width 1s ease-in-out'
              }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {((metrics.metasMensais.receita.atual / metrics.metasMensais.receita.meta) * 100).toFixed(1)}% da meta alcançada
            </Typography>
          </Box>

          {/* Meta de Corridas */}
          <Box sx={{ 
            p: 3,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Meta de Corridas
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {metrics.metasMensais.corridas.atual} / {metrics.metasMensais.corridas.meta}
              </Typography>
            </Box>
            <Box sx={{ 
              height: 8, 
              bgcolor: 'grey.200', 
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                height: '100%', 
                width: `${Math.min((metrics.metasMensais.corridas.atual / metrics.metasMensais.corridas.meta) * 100, 100)}%`,
                bgcolor: getProgressColor(metrics.metasMensais.corridas.atual, metrics.metasMensais.corridas.meta),
                transition: 'width 1s ease-in-out'
              }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {((metrics.metasMensais.corridas.atual / metrics.metasMensais.corridas.meta) * 100).toFixed(1)}% da meta alcançada
            </Typography>
          </Box>

          {/* Meta de Gastos */}
          <Box sx={{ 
            p: 3,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Controle de Gastos
                </Typography>
                {metrics.metasMensais.gastos.atual > metrics.metasMensais.gastos.meta && (
                  <Warning color="error" fontSize="small" />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(metrics.metasMensais.gastos.atual)} / {formatCurrency(metrics.metasMensais.gastos.meta)}
              </Typography>
            </Box>
            <Box sx={{ 
              height: 8, 
              bgcolor: 'grey.200', 
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                height: '100%', 
                width: `${Math.min((metrics.metasMensais.gastos.atual / metrics.metasMensais.gastos.meta) * 100, 100)}%`,
                bgcolor: metrics.metasMensais.gastos.atual <= metrics.metasMensais.gastos.meta ? 
                  theme.palette.success.main : theme.palette.error.main,
                transition: 'width 1s ease-in-out'
              }} />
            </Box>
            <Typography 
              variant="caption" 
              color={metrics.metasMensais.gastos.atual <= metrics.metasMensais.gastos.meta ? 
                'success.main' : 'error.main'
              } 
              sx={{ mt: 1 }}
            >
              {((metrics.metasMensais.gastos.atual / metrics.metasMensais.gastos.meta) * 100).toFixed(1)}% do orçamento utilizado
              {metrics.metasMensais.gastos.atual > metrics.metasMensais.gastos.meta && ' (Acima da meta!)'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Dicas de Melhoria */}
      <Box sx={{ 
        p: 3,
        bgcolor: 'info.main',
        color: 'info.contrastText',
        borderRadius: 1
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          💡 Dicas para Melhorar Performance
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {metrics.eficiencia < 85 && (
            <Typography variant="body2">
              • Foque em melhorar a eficiência geral mantendo um bom tempo médio de entrega
            </Typography>
          )}
          {metrics.kmPorLitro < 12 && (
            <Typography variant="body2">
              • Considere revisar o estilo de condução para melhorar o consumo de combustível
            </Typography>
          )}
          {metrics.taxaAceitacao < 90 && (
            <Typography variant="body2">
              • Tente aumentar a taxa de aceitação para ter mais oportunidades de ganho
            </Typography>
          )}
          <Typography variant="body2">
            • Continue mantendo um bom relacionamento com os clientes para manter a avaliação alta
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
