'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
  AccessTime as AccessTimeIcon,
  Update as UpdateIcon
} from '@mui/icons-material'
import { 
  Goal, 
  calculateProgress, 
  formatCurrency, 
  getDaysUntilDeadline, 
  getProgressColor,
  isGoalExpired
} from '../../utils/goalUtils'

interface GoalCardProps {
  goal: Goal
  onEdit?: (goal: Goal) => void
  onDelete?: (goalId: string) => void
  onUpdateProgress?: (goalId: string, newValue: number) => void
}

export default function GoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onUpdateProgress 
}: GoalCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [newValue, setNewValue] = useState(goal.currentValue.toString())
  
  const progress = calculateProgress(goal.currentValue, goal.targetValue)
  const daysUntilDeadline = getDaysUntilDeadline(goal)

  // Funções auxiliares
  const getCategoryColor = (): 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (goal.category) {
      case 'emergency': return 'error'
      case 'investment': return 'success'
      case 'purchase': return 'primary'
      case 'travel': return 'info'
      case 'education': return 'secondary'
      case 'health': return 'warning'
      default: return 'primary'
    }
  }

  const getStatusColor = (): 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (goal.status) {
      case 'active': return 'primary'
      case 'completed': return 'success'
      case 'paused': return 'warning'
      default: return 'primary'
    }
  }

  const getStatusLabel = () => {
    switch (goal.status) {
      case 'active': return 'Ativa'
      case 'completed': return 'Concluída'
      case 'paused': return 'Pausada'
      default: return goal.status
    }
  }

  const getDeadlineColor = (): 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    if (goal.status === 'completed') return 'success'
    if (isGoalExpired(goal)) return 'error'
    if (daysUntilDeadline <= 0) return 'error'
    if (daysUntilDeadline <= 7) return 'warning'
    if (daysUntilDeadline <= 30) return 'info'
    return 'inherit'
  }

  const getDeadlineText = () => {
    if (goal.status === 'completed') return 'Concluída'
    if (isGoalExpired(goal)) return 'Expirada'
    if (daysUntilDeadline <= 0) return 'Vencida'
    if (daysUntilDeadline === 1) return '1 dia restante'
    return `${daysUntilDeadline} dias restantes`
  }

  // Event handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    onEdit?.(goal)
    handleMenuClose()
  }

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      onDelete?.(goal.id)
    }
    handleMenuClose()
  }

  const handleUpdateProgress = () => {
    setUpdateDialogOpen(true)
    handleMenuClose()
  }

  const handleUpdateSubmit = () => {
    const value = parseFloat(newValue)
    if (!isNaN(value) && value >= 0) {
      onUpdateProgress?.(goal.id, value)
      setUpdateDialogOpen(false)
    }
  }

  const handleUpdateCancel = () => {
    setNewValue(goal.currentValue.toString())
    setUpdateDialogOpen(false)
  }
  
  const getCategoryIcon = () => {
    switch (goal.category) {
      case 'receita':
        return <TrendingUpIcon color="success" />
      case 'despesa':
        return <TrendingDownIcon color="error" />
      case 'economia':
        return <SavingsIcon color="info" />
      default:
        return <SavingsIcon />
    }
  }

  return (
    <>
      <Card 
        sx={{ 
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent>
          {/* Cabeçalho */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              {getCategoryIcon()}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  {goal.title}
                </Typography>
                {goal.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {goal.description}
                  </Typography>
                )}
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={getStatusLabel()} 
                color={getStatusColor()} 
                size="small" 
                variant="outlined"
              />
              <IconButton 
                size="small" 
                onClick={handleMenuClick}
                aria-label="opções"
              >
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Progresso */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progresso
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {progress.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4
              }} 
            />
          </Box>

          {/* Valores */}
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Atual
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(goal.currentValue)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Meta
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(goal.targetValue)}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip 
              label={goal.category.charAt(0).toUpperCase() + goal.category.slice(1)} 
              color={getCategoryColor()} 
              size="small" 
            />
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTimeIcon sx={{ fontSize: 16 }} color={getDeadlineColor()} />
              <Typography 
                variant="caption" 
                color={getDeadlineColor()}
                sx={{ 
                  fontWeight: daysUntilDeadline <= 7 ? 'bold' : 'normal'
                }}
              >
                {getDeadlineText()}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Menu de Ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit} disabled={!onEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Editar
        </MenuItem>
        
        <MenuItem onClick={handleUpdateProgress} disabled={!onUpdateProgress || goal.status === 'completed'}>
          <UpdateIcon sx={{ mr: 1, fontSize: 18 }} />
          Atualizar Progresso
        </MenuItem>
        
        <MenuItem onClick={handleDelete} disabled={!onDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de Atualização de Progresso */}
      <Dialog open={updateDialogOpen} onClose={handleUpdateCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Atualizar Progresso</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Meta: {goal.title}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Valor Atual"
            type="number"
            fullWidth
            variant="outlined"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            inputProps={{
              min: 0,
              step: 0.01
            }}
            helperText={`Meta: ${formatCurrency(goal.targetValue)}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateCancel}>Cancelar</Button>
          <Button 
            onClick={handleUpdateSubmit} 
            variant="contained"
            disabled={!newValue || parseFloat(newValue) < 0}
          >
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
