'use client'

import React from 'react'
import { Stack, TextField, MenuItem, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { FilterType, CategoryType, SortType, goalCategories, goalStatuses } from '../../utils/goalUtils'

interface GoalFiltersProps {
  filter: FilterType
  category: CategoryType
  sortBy: SortType
  searchTerm: string
  onFilterChange: (filter: FilterType) => void
  onCategoryChange: (category: CategoryType) => void
  onSortChange: (sort: SortType) => void
  onSearchChange: (term: string) => void
}

export default function GoalFilters({
  filter,
  category,
  sortBy,
  searchTerm,
  onFilterChange,
  onCategoryChange,
  onSortChange,
  onSearchChange
}: GoalFiltersProps) {
  return (
    <Stack direction="row" flexWrap="wrap" spacing={1} alignItems="center" sx={{ gap: 8 }}>
      <TextField
        select
        label="Status"
        value={filter}
        onChange={e => onFilterChange(e.target.value as FilterType)}
        size="small"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="all">Todos</MenuItem>
        {goalStatuses.map(status => (
          <MenuItem key={status.value} value={status.value}>
            {status.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Categoria"
        value={category}
        onChange={e => onCategoryChange(e.target.value as CategoryType)}
        size="small"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="all">Todas</MenuItem>
        {goalCategories.map(cat => (
          <MenuItem key={cat.value} value={cat.value}>
            {cat.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Ordenar por"
        value={sortBy}
        onChange={e => onSortChange(e.target.value as SortType)}
        size="small"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="created">Mais recentes</MenuItem>
        <MenuItem value="deadline">Data limite</MenuItem>
        <MenuItem value="progress">Progresso</MenuItem>
        <MenuItem value="value">Valor</MenuItem>
        <MenuItem value="title">Título</MenuItem>
      </TextField>

      <TextField
        label="Buscar"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />
    </Stack>
  )
}
