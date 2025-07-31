'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUber
} from '@fortawesome/free-brands-svg-icons'
import {
  faCar,
  faGasPump,
  faUtensils,
  faPhone,
  faCoffee,
  faShoppingBag,
  faReceipt,
  faLocationDot,
  faEllipsisVertical
} from '@fortawesome/free-solid-svg-icons'
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  useTheme
} from '@mui/material'

interface TransactionCardProps {
  transaction: {
    id: number
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    time: string
    status: 'completed' | 'pending'
    platform?: string
    location?: string
  }
  onMenuClick?: (event: React.MouseEvent<HTMLElement>, transactionId: number) => void
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

const getCategoryIcon = (category: string, type: 'income' | 'expense') => {
  const iconStyle = { fontSize: '2.2rem' }
  
  if (type === 'income') {
    switch (category) {
      case 'Uber':
        return <FontAwesomeIcon icon={faUber} style={iconStyle} />
      case '99':
        return <Box sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          bgcolor: '#FFD700', 
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          99
        </Box>
      case 'InDriver':
        return <Box sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          bgcolor: '#007ACC', 
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}>
          ID
        </Box>
      case 'Cabify':
        return <Box sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          bgcolor: '#752C7B', 
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          fontWeight: 'bold'
        }}>
          C
        </Box>
      default:
        return <FontAwesomeIcon icon={faCar} style={iconStyle} />
    }
  } else {
    switch (category) {
      case 'Combustível':
        return <FontAwesomeIcon icon={faGasPump} style={iconStyle} />
      case 'Alimentação':
        return <FontAwesomeIcon icon={faUtensils} style={iconStyle} />
      case 'Telefone':
        return <FontAwesomeIcon icon={faPhone} style={iconStyle} />
      case 'Café':
        return <FontAwesomeIcon icon={faCoffee} style={iconStyle} />
      case 'Compras':
        return <FontAwesomeIcon icon={faShoppingBag} style={iconStyle} />
      case 'Manutenção':
        return <FontAwesomeIcon icon={faCar} style={iconStyle} />
      default:
        return <FontAwesomeIcon icon={faReceipt} style={iconStyle} />
    }
  }
}

const getCategoryColor = (category: string, type: 'income' | 'expense') => {
  if (type === 'income') {
    switch (category) {
      case 'Uber': return '#000000'
      case '99': return '#FFD700'
      case 'InDriver': return '#007ACC'
      case 'Cabify': return '#752C7B'
      default: return '#4CAF50'
    }
  } else {
    switch (category) {
      case 'Combustível': return '#FF6B6B'
      case 'Alimentação': return '#4ECDC4'
      case 'Telefone': return '#45B7D1'
      case 'Café': return '#D4A574'
      case 'Compras': return '#96CEB4'
      case 'Manutenção': return '#FFA726'
      default: return '#95A5A6'
    }
  }
}

export default function TransactionCard({ transaction, onMenuClick }: TransactionCardProps) {
  const theme = useTheme()
  const isIncome = transaction.type === 'income'
  const categoryColor = getCategoryColor(transaction.category, transaction.type)
  
  return (
    <Card 
      sx={{
        borderRadius: 4,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(0, 0, 0, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: isIncome ? 'success.main' : 'error.main',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 16px rgba(0, 0, 0, 0.6)'
            : '0 4px 16px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'row', sm: 'row' }
        }}>
          {/* Ícone da categoria */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: isIncome 
                ? 'rgba(76, 175, 80, 0.15)'
                : 'rgba(244, 67, 54, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: categoryColor,
              flexShrink: 0
            }}
          >
            {getCategoryIcon(transaction.category, transaction.type)}
          </Box>

          {/* Conteúdo principal */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Container responsivo para título e valor no mobile */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: { xs: 'flex-start', sm: 'space-between' },
              alignItems: { xs: 'flex-start', sm: 'flex-start' },
              gap: { xs: 1, sm: 0 },
              mb: 1
            }}>
              {/* Título */}
              <Typography 
                variant="body1" 
                fontWeight={600}
                sx={{ 
                  lineHeight: 1.3,
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {transaction.description}
              </Typography>
              
              {/* Valor no mobile */}
              <Box sx={{ 
                display: { xs: 'block', sm: 'none' },
                alignSelf: 'flex-start'
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    color: isIncome ? '#4CAF50' : '#F44336',
                    lineHeight: 1.2,
                    fontSize: '1rem'
                  }}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Typography>
              </Box>
            </Box>
            
            {/* Detalhes organizados verticalmente no mobile */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 1.5 },
              mb: { xs: 1, sm: 0.5 }
            }}>
              {/* Categoria e hora */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    fontSize: '0.875rem'
                  }}
                >
                  {transaction.category}
                </Typography>
                <Box sx={{ 
                  width: 4, 
                  height: 4, 
                  borderRadius: '50%', 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  display: { xs: 'none', sm: 'block' }
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    fontSize: '0.875rem'
                  }}
                >
                  {transaction.time}
                </Typography>
              </Box>
              
              {/* Status no mobile */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Chip 
                  label={transaction.status === 'completed' ? 'Concluída' : 'Pendente'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    bgcolor: transaction.status === 'completed' 
                      ? 'rgba(76, 175, 80, 0.15)' 
                      : 'rgba(255, 152, 0, 0.15)',
                    color: transaction.status === 'completed' ? '#4CAF50' : '#FF9800',
                    border: 'none'
                  }}
                />
              </Box>
            </Box>

            {/* Localização */}
            {transaction.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FontAwesomeIcon 
                  icon={faLocationDot} 
                  style={{ 
                    fontSize: '0.75rem',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                    fontSize: '0.8125rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {transaction.location}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Valor e Status - apenas desktop */}
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            alignItems: 'center', 
            gap: 1.5, 
            flexShrink: 0 
          }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ 
                  color: isIncome ? '#4CAF50' : '#F44336',
                  lineHeight: 1.2,
                  fontSize: '1.125rem'
                }}
              >
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Typography>
              
              <Chip 
                label={transaction.status === 'completed' ? 'Concluída' : 'Pendente'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  bgcolor: transaction.status === 'completed' 
                    ? 'rgba(76, 175, 80, 0.15)' 
                    : 'rgba(255, 152, 0, 0.15)',
                  color: transaction.status === 'completed' ? '#4CAF50' : '#FF9800',
                  border: 'none',
                  mt: 0.5
                }}
              />
            </Box>
            
            <IconButton 
              size="small"
              onClick={(e) => onMenuClick?.(e, transaction.id)}
              sx={{ 
                opacity: 0.6,
                '&:hover': { 
                  opacity: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Box>
          
          {/* Menu de ações - apenas mobile */}
          <Box sx={{ 
            display: { xs: 'flex', sm: 'none' }, 
            alignItems: 'center',
            alignSelf: 'flex-start',
            mt: { xs: 0.5, sm: 0 }
          }}>
            <IconButton 
              size="small"
              onClick={(e) => onMenuClick?.(e, transaction.id)}
              sx={{ 
                opacity: 0.6,
                '&:hover': { 
                  opacity: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}
