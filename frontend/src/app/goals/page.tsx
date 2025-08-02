'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Fab,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import GoalCard from '../../components/goals/GoalCard'
import GoalModal from '../../components/goals/GoalModal'
import GoalStats from '../../components/goals/GoalStats'
import SearchIcon from '@mui/icons-material/Search'
import { Goal, GoalStatus, filterGoals, sortGoals, FilterType, CategoryType, SortType } from '../../utils/goalUtils'

// Mock data para demonstração
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Aumentar Receita Mensal',
    description: 'Meta de aumentar a receita do negócio para expandir operações',
    targetValue: 15000,
    currentValue: 8500,
    deadline: '2025-12-31',
    category: 'investment',
    status: 'active',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-07-20T10:00:00.000Z'
  },
  {
    id: '2',
    title: 'Reserva de Emergência',
    description: 'Construir uma reserva de emergência para 6 meses de despesas',
    targetValue: 30000,
    currentValue: 30000,
    deadline: '2025-06-30',
    category: 'emergency',
    status: 'completed',
    createdAt: '2024-12-01T10:00:00.000Z',
    updatedAt: '2025-06-30T10:00:00.000Z'
  },
  {
    id: '3',
    title: 'Reduzir Custos Operacionais',
    description: 'Diminuir despesas desnecessárias e otimizar processos',
    targetValue: 5000,
    currentValue: 3200,
    deadline: '2025-09-30',
    category: 'other',
    status: 'active',
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-07-25T10:00:00.000Z'
  },
  {
    id: '4',
    title: 'Comprar Novo Equipamento',
    description: 'Economizar para comprar novos equipamentos para o escritório',
    targetValue: 8000,
    currentValue: 2500,
    deadline: '2025-11-15',
    category: 'purchase',
    status: 'active',
    createdAt: '2025-03-10T10:00:00.000Z',
    updatedAt: '2025-07-25T10:00:00.000Z'
  },
  {
    id: '5',
    title: 'Viagem de Férias',
    description: 'Economizar para uma viagem em família nas próximas férias',
    targetValue: 12000,
    currentValue: 4800,
    deadline: '2025-12-20',
    category: 'travel',
    status: 'paused',
    createdAt: '2025-01-20T10:00:00.000Z',
    updatedAt: '2025-06-15T10:00:00.000Z'
  }
]

export default function GoalsPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Estados
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>()
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Estados dos filtros
  const [filter, setFilter] = useState<FilterType>('all')
  const [category, setCategory] = useState<CategoryType>('all')
  const [sortBy, setSortBy] = useState<SortType>('created')

  // Metas filtradas e ordenadas, incluindo busca
  const filteredAndSortedGoals = useMemo(() => {
    const statusFilter = filter === 'all' ? undefined : [filter as GoalStatus]
    const categoryFilter = category === 'all' ? undefined : [category]
    const term = searchTerm.trim() === '' ? undefined : searchTerm.trim()
    const filtered = filterGoals(goals, {
      status: statusFilter,
      category: categoryFilter,
      searchTerm: term
    })
    return sortGoals(filtered, sortBy)
  }, [goals, filter, category, sortBy, searchTerm])

  // Handlers
  const handleCreateGoal = (goalData: Partial<Goal>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Goal
    
    setGoals(prev => [...prev, newGoal])
    setModalOpen(false)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setModalOpen(true)
  }

  const handleUpdateGoal = (goalData: Partial<Goal>) => {
    if (!editingGoal) return
    
    setGoals(prev => prev.map(goal => 
      goal.id === editingGoal.id 
        ? { ...goal, ...goalData, updatedAt: new Date().toISOString() }
        : goal
    ))
    setModalOpen(false)
    setEditingGoal(undefined)
  }

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
  }

  const handleUpdateProgress = (goalId: string, newValue: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentValue: newValue, updatedAt: new Date().toISOString() }
        : goal
    ))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingGoal(undefined)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems={isMobile ? 'stretch' : 'center'}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Metas Financeiras
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie suas metas e acompanhe seu progresso financeiro
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            size={isMobile ? 'medium' : 'large'}
            sx={{ minWidth: 160 }}
          >
            Nova Meta
          </Button>
        </Stack>
      </Box>

      {/* Estatísticas */}
      <Box sx={{ mb: 4 }}>
        <GoalStats goals={goals} />
      </Box>
      {/* Campo de Busca */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar metas..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Lista de Metas */}
      <Box>
        {filteredAndSortedGoals.length === 0 ? (
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center',
            backgroundColor: 'background.default'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {goals.length === 0 ? 'Nenhuma meta cadastrada' : 'Nenhuma meta encontrada'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {goals.length === 0 
                ? 'Comece criando sua primeira meta financeira'
                : 'Tente ajustar os filtros para encontrar suas metas'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
            >
              {goals.length === 0 ? 'Criar Primeira Meta' : 'Nova Meta'}
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {filteredAndSortedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* FAB para mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => setModalOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Modal de Nova Meta / Edição */}
      <GoalModal
        open={modalOpen}
        goal={editingGoal}
        onClose={handleCloseModal}
        onSave={editingGoal ? handleUpdateGoal : handleCreateGoal}
      />
    </Container>
  )
}
