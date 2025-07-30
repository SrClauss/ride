'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  LinearProgress,
  Avatar,
  Stack,
  Badge,
  Tooltip
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  LocalGasStation as FuelIcon,
  Restaurant as RestaurantIcon,
  Phone as PhoneIcon,
  DirectionsCar as CarIcon,
  Coffee as CoffeeIcon,
  ShoppingCart as ShoppingIcon,
  CreditCard as CreditCardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  CalendarMonth as CalendarIcon,
  FileDownload as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material'
import FilterDrawer, { FilterOptions } from './FilterDrawer'
import TransactionCard from './TransactionCard'

// Mock data para demonstração - dados realistas de motorista de aplicativo
const mockTransactions = [
  {
    id: 1,
    description: 'Combustível',
    amount: 120.00,
    type: 'expense' as const,
    category: 'Combustível',
    date: new Date().toISOString(),
    time: '13:15',
    status: 'completed' as const,
    location: 'Posto Shell'
  },
  {
    id: 2,
    description: 'Corrida 99 - Shopping para Casa',
    amount: 28.75,
    type: 'income' as const,
    category: '99',
    date: new Date().toISOString(),
    time: '12:45',
    status: 'completed' as const,
    platform: '99',
    location: 'São Paulo, SP'
  },
  {
    id: 3,
    description: 'Almoço',
    amount: 35.00,
    type: 'expense' as const,
    category: 'Alimentação',
    date: new Date().toISOString(),
    time: '12:00',
    status: 'completed' as const,
    location: 'Restaurante...'
  },
  {
    id: 4,
    description: 'Corrida InDriver - Trabalho',
    amount: 22.30,
    type: 'income' as const,
    category: 'InDriver',
    date: new Date().toISOString(),
    time: '08:30',
    status: 'completed' as const,
    platform: 'InDriver',
    location: 'São Paulo, SP'
  },
  {
    id: 5,
    description: 'Corrida Uber - Centro para Aeroporto',
    amount: 45.50,
    type: 'income' as const,
    category: 'Uber',
    date: new Date().toISOString(),
    time: '14:30',
    status: 'completed' as const,
    platform: 'Uber',
    location: 'São Paulo, SP'
  }
]

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

const formatTime = (timeString: string): string => {
  return timeString
}

interface TransactionListProps {
  onAddTransaction?: () => void
}

export default function TransactionList({ onAddTransaction }: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    amountRange: { min: 0, max: 1000 },
    categories: [],
    platforms: [],
    type: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const filteredTransactions = useMemo(() => {
    const filtered = mockTransactions.filter(transaction => {
      // Filtro por tipo básico
      if (selectedFilter === 'income' && transaction.type !== 'income') return false
      if (selectedFilter === 'expense' && transaction.type !== 'expense') return false
      
      // Filtro por busca
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Filtros avançados
      if (advancedFilters.type !== 'all' && transaction.type !== advancedFilters.type) return false
      
      if (advancedFilters.categories.length > 0 && !advancedFilters.categories.includes(transaction.category)) return false
      
      if (advancedFilters.platforms.length > 0 && transaction.platform && !advancedFilters.platforms.includes(transaction.platform)) return false
      
      if (transaction.amount < advancedFilters.amountRange.min || transaction.amount > advancedFilters.amountRange.max) return false
      
      // Filtro por data
      if (advancedFilters.dateRange.start && transaction.date < advancedFilters.dateRange.start) return false
      if (advancedFilters.dateRange.end && transaction.date > advancedFilters.dateRange.end) return false
      
      return true
    })

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (advancedFilters.sortBy) {
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'date':
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
      }
      
      return advancedFilters.sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [searchQuery, selectedFilter, advancedFilters])

  const summaryData = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalTransactions: filteredTransactions.length
    }
  }, [filteredTransactions])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transactionId: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedTransaction(transactionId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTransaction(null)
  }

  const handleApplyFilters = (filters: FilterOptions) => {
    setAdvancedFilters(filters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) count++
    if (advancedFilters.amountRange.min > 0 || advancedFilters.amountRange.max < 1000) count++
    if (advancedFilters.categories.length > 0) count++
    if (advancedFilters.platforms.length > 0) count++
    if (advancedFilters.type !== 'all') count++
    return count
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header com título e botão de adicionar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Transações
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddTransaction}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 2
          }}
        >
          Nova Transação
        </Button>
      </Box>

      {/* Cards de resumo */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4
      }}>
        {/* Receitas */}
        <Card sx={{ 
          background: (theme) => theme.palette.mode === 'dark' ? 
            'linear-gradient(135deg, #1a2e1a 0%, #2e7d32 100%)' : 
            'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? '#2e7d32' : '#4caf50'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <TrendingUpIcon sx={{ color: '#4caf50' }} />
              <Chip 
                label="+5.2%" 
                size="small" 
                sx={{ 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2e7d32' : '#4caf50',
                  color: '#fff',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {formatCurrency(summaryData.totalIncome)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Receitas do Dia
            </Typography>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card sx={{ 
          background: (theme) => theme.palette.mode === 'dark' ? 
            'linear-gradient(135deg, #2e1a1a 0%, #d32f2f 100%)' : 
            'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? '#d32f2f' : '#f44336'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <TrendingDownIcon sx={{ color: '#f44336' }} />
              <Chip 
                label="-2.1%" 
                size="small" 
                sx={{ 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#d32f2f' : '#f44336',
                  color: '#fff',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight="bold" color="error.main">
              {formatCurrency(summaryData.totalExpenses)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Despesas do Dia
            </Typography>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card sx={{ 
          background: (theme) => theme.palette.mode === 'dark' ? 
            'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)' : 
            'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? '#3f51b5' : '#2196f3'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <WalletIcon sx={{ color: '#2196f3' }} />
              <Chip 
                label="+8.5%" 
                size="small" 
                sx={{ 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#3f51b5' : '#2196f3',
                  color: '#fff',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight="bold" color="info.main">
              {formatCurrency(summaryData.balance)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Saldo do Dia
            </Typography>
          </CardContent>
        </Card>

        {/* Total de Transações */}
        <Card sx={{ 
          background: (theme) => theme.palette.mode === 'dark' ? 
            'linear-gradient(135deg, #2e2d2e 0%, #616161 100%)' : 
            'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? '#616161' : '#9e9e9e'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <ReceiptIcon sx={{ color: '#9e9e9e' }} />
              <Badge badgeContent={summaryData.totalTransactions} color="primary" />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              {summaryData.totalTransactions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Transações Hoje
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filtros e busca */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <TextField
          placeholder="Buscar transações..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        
        <Stack direction="row" spacing={1}>
          <Chip
            label="Todas"
            onClick={() => setSelectedFilter('all')}
            color={selectedFilter === 'all' ? 'primary' : 'default'}
            variant={selectedFilter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Receitas"
            onClick={() => setSelectedFilter('income')}
            color={selectedFilter === 'income' ? 'success' : 'default'}
            variant={selectedFilter === 'income' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Despesas"
            onClick={() => setSelectedFilter('expense')}
            color={selectedFilter === 'expense' ? 'error' : 'default'}
            variant={selectedFilter === 'expense' ? 'filled' : 'outlined'}
          />
        </Stack>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Tooltip title="Filtros avançados">
            <IconButton onClick={() => setIsFilterDrawerOpen(true)}>
              <Badge badgeContent={getActiveFiltersCount()} color="primary">
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Lista de transações */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredTransactions.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma transação encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery ? 'Tente ajustar sua busca ou filtros' : 'Suas transações aparecerão aqui'}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAddTransaction}>
              Adicionar Primeira Transação
            </Button>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onMenuClick={handleMenuOpen}
            />
          ))
        )}
      </Box>

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Ver Detalhes
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Filter Drawer */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </Box>
  )
}
