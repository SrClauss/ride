'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
  InputAdornment,
  FormHelperText,
  Avatar
} from '@mui/material'
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  DirectionsCar as CarIcon,
  LocalGasStation as FuelIcon,
  Restaurant as RestaurantIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon
} from '@mui/icons-material'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  onSubmit?: (transaction: TransactionFormData) => void
  transaction?: TransactionFormData | null
}

export interface TransactionFormData {
  id?: number
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  platform?: string
  location?: string
}

const incomeCategories = [
  { value: 'Uber', label: 'Uber', color: '#000000' },
  { value: '99', label: '99', color: '#FFD700' },
  { value: 'InDriver', label: 'InDriver', color: '#007ACC' },
  { value: 'Cabify', label: 'Cabify', color: '#752C7B' },
  { value: 'Outros', label: 'Outras Receitas', color: '#4CAF50' }
]

const expenseCategories = [
  { value: 'Combustível', label: 'Combustível', icon: FuelIcon, color: '#FF6B6B' },
  { value: 'Alimentação', label: 'Alimentação', icon: RestaurantIcon, color: '#4ECDC4' },
  { value: 'Telefone', label: 'Telefone', icon: PhoneIcon, color: '#45B7D1' },
  { value: 'Manutenção', label: 'Manutenção', icon: CarIcon, color: '#96CEB4' },
  { value: 'Compras', label: 'Compras', icon: ShoppingIcon, color: '#FECA57' },
  { value: 'Outros', label: 'Outras Despesas', icon: ReceiptIcon, color: '#FF9FF3' }
]

export default function TransactionModal({ 
  open, 
  onClose, 
  onSubmit, 
  transaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'income',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    platform: '',
    location: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (transaction) {
      setFormData(transaction)
    } else {
      setFormData({
        type: 'income',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        platform: '',
        location: ''
      })
    }
    setErrors({})
  }, [transaction, open])

  const handleChange = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Reset category when type changes
      if (field === 'type') {
        newData.category = ''
        newData.platform = ''
      }
      
      return newData
    })
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit?.(formData)
      onClose()
    }
  }

  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories

  const getCategoryIcon = (categoryValue: string) => {
    if (formData.type === 'income') {
      return (
        <Avatar 
          sx={{ 
            width: 24, 
            height: 24, 
            fontSize: '0.75rem',
            bgcolor: incomeCategories.find(c => c.value === categoryValue)?.color || '#000',
            color: categoryValue === '99' ? '#000' : '#fff'
          }}
        >
          {categoryValue.charAt(0)}
        </Avatar>
      )
    } else {
      const category = expenseCategories.find(c => c.value === categoryValue)
      const IconComponent = category?.icon || ReceiptIcon
      return <IconComponent sx={{ color: category?.color || '#95A5A6' }} />
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          m: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" fontWeight="bold">
          {transaction ? 'Editar Transação' : 'Nova Transação'}
        </Typography>
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 1 }}
          color="inherit"
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Tipo de Transação */}
          <FormControl fullWidth>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Tipo de Transação
            </Typography>
            <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={(_, value) => value && handleChange('type', value)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600
                }
              }}
            >
              <ToggleButton value="income" sx={{ color: 'success.main' }}>
                <IncomeIcon sx={{ mr: 1 }} />
                Receita
              </ToggleButton>
              <ToggleButton value="expense" sx={{ color: 'error.main' }}>
                <ExpenseIcon sx={{ mr: 1 }} />
                Despesa
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>

          {/* Categoria */}
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              label="Categoria"
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {value && getCategoryIcon(value)}
                  {currentCategories.find(c => c.value === value)?.label}
                </Box>
              )}
            >
              {currentCategories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formData.type === 'income' ? (
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.75rem',
                          bgcolor: category.color,
                          color: category.value === '99' ? '#000' : '#fff'
                        }}
                      >
                        {category.value.charAt(0)}
                      </Avatar>
                    ) : (
                      (() => {
                        const IconComponent = (category as any).icon || ReceiptIcon
                        return <IconComponent sx={{ color: category.color }} />
                      })()
                    )}
                    {category.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
          </FormControl>

          {/* Valor */}
          <TextField
            label="Valor"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            error={!!errors.amount}
            helperText={errors.amount}
            fullWidth
            inputProps={{ 
              step: "0.01",
              min: "0"
            }}
          />

          {/* Descrição */}
          <TextField
            label="Descrição"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            multiline
            rows={2}
            placeholder="Descreva a transação..."
          />

          {/* Data */}
          <TextField
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Campos específicos para receitas */}
          {formData.type === 'income' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Plataforma"
                value={formData.platform || ''}
                onChange={(e) => handleChange('platform', e.target.value)}
                fullWidth
                placeholder="Ex: Uber, 99..."
              />
              <TextField
                label="Localização"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                fullWidth
                placeholder="Ex: Centro - Aeroporto"
              />
            </Box>
          )}

          {/* Localização para despesas */}
          {formData.type === 'expense' && (
            <TextField
              label="Local"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              fullWidth
              placeholder="Ex: Posto Shell, Restaurante..."
            />
          )}

          {/* Preview do valor */}
          {formData.amount > 0 && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: formData.type === 'income' ? 'success.light' : 'error.light',
              border: '1px solid',
              borderColor: formData.type === 'income' ? 'success.main' : 'error.main'
            }}>
              <Typography 
                variant="h6" 
                color={formData.type === 'income' ? 'success.dark' : 'error.dark'}
                fontWeight="bold"
              >
                {formData.type === 'income' ? '+' : '-'}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(formData.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.type === 'income' ? 'Receita' : 'Despesa'} em {formData.category}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ borderRadius: 2 }}
          disabled={!formData.amount || !formData.category || !formData.description.trim()}
        >
          {transaction ? 'Atualizar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
