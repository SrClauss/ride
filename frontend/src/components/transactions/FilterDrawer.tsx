'use client'

import React, { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Button,
  FormControlLabel,
  Switch,
  Slider,
  Card,
  CardContent
} from '@mui/material'
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  onApplyFilters?: (filters: FilterOptions) => void
}

export interface FilterOptions {
  dateRange: {
    start: string
    end: string
  }
  amountRange: {
    min: number
    max: number
  }
  categories: string[]
  platforms: string[]
  type: 'all' | 'income' | 'expense'
  sortBy: 'date' | 'amount' | 'category'
  sortOrder: 'asc' | 'desc'
}

const defaultFilters: FilterOptions = {
  dateRange: {
    start: '',
    end: ''
  },
  amountRange: {
    min: 0,
    max: 1000
  },
  categories: [],
  platforms: [],
  type: 'all',
  sortBy: 'date',
  sortOrder: 'desc'
}

const availableCategories = [
  'Uber', '99', 'InDriver', 'Cabify',
  'Combustível', 'Alimentação', 'Telefone', 'Manutenção', 'Compras'
]

const availablePlatforms = ['Uber', '99', 'InDriver', 'Cabify']

export default function FilterDrawer({ open, onClose, onApplyFilters }: FilterDrawerProps) {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)
  const [hasChanges, setHasChanges] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleNestedFilterChange = (parentKey: keyof FilterOptions, childKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }))
    setHasChanges(true)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    handleFilterChange('categories', newCategories)
  }

  const handlePlatformToggle = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform]
    
    handleFilterChange('platforms', newPlatforms)
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
    setHasChanges(false)
  }

  const handleApplyFilters = () => {
    onApplyFilters?.(filters)
    setHasChanges(false)
    onClose()
  }

  const getFilterCount = () => {
    let count = 0
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.amountRange.min > 0 || filters.amountRange.max < 1000) count++
    if (filters.categories.length > 0) count++
    if (filters.platforms.length > 0) count++
    if (filters.type !== 'all') count++
    return count
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6" fontWeight="bold">
              Filtros Avançados
            </Typography>
            {getFilterCount() > 0 && (
              <Chip 
                label={getFilterCount()} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Button
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
            variant="outlined"
            size="small"
            disabled={!hasChanges}
          >
            Limpar
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {/* Período */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon />
                Período
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Data Inicial"
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleNestedFilterChange('dateRange', 'start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Data Final"
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleNestedFilterChange('dateRange', 'end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Tipo de Transação */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Tipo de Transação
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="income">Receitas</MenuItem>
                  <MenuItem value="expense">Despesas</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Faixa de Valores */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Faixa de Valores
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={[filters.amountRange.min, filters.amountRange.max]}
                  onChange={(_, newValue) => {
                    const [min, max] = newValue as number[]
                    handleNestedFilterChange('amountRange', 'min', min)
                    handleNestedFilterChange('amountRange', 'max', max)
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `R$ ${value}`}
                  min={0}
                  max={1000}
                  step={10}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">
                    R$ {filters.amountRange.min}
                  </Typography>
                  <Typography variant="caption">
                    R$ {filters.amountRange.max}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Categorias
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableCategories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryToggle(category)}
                    color={filters.categories.includes(category) ? 'primary' : 'default'}
                    variant={filters.categories.includes(category) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Plataformas */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Plataformas
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availablePlatforms.map((platform) => (
                  <Chip
                    key={platform}
                    label={platform}
                    onClick={() => handlePlatformToggle(platform)}
                    color={filters.platforms.includes(platform) ? 'primary' : 'default'}
                    variant={filters.platforms.includes(platform) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Ordenação */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Ordenação
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ordenar por</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    label="Ordenar por"
                  >
                    <MenuItem value="date">Data</MenuItem>
                    <MenuItem value="amount">Valor</MenuItem>
                    <MenuItem value="category">Categoria</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.sortOrder === 'desc'}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.checked ? 'desc' : 'asc')}
                    />
                  }
                  label={filters.sortOrder === 'desc' ? 'Decrescente' : 'Crescente'}
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={onClose}
              variant="outlined"
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApplyFilters}
              variant="contained"
              fullWidth
              startIcon={<CheckIcon />}
              disabled={!hasChanges}
            >
              Aplicar Filtros
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  )
}
