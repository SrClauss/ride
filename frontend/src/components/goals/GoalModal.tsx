'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  MenuItem,
  LinearProgress,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material'
import { Goal, goalCategories, calculateProgress, formatCurrency, createEmptyGoal } from '../../utils/goalUtils'

interface GoalModalProps {
  open: boolean
  goal?: Goal
  onClose: () => void
  onSave: (goalData: Partial<Goal>) => void
}

export default function GoalModal({ open, goal, onClose, onSave }: GoalModalProps) {
  const isEditing = !!goal
  const [formData, setFormData] = useState(() => 
    goal || createEmptyGoal()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (goal) {
      setFormData(goal)
    } else {
      setFormData(createEmptyGoal())
    }
    setErrors({})
  }, [goal, open])

  const handleChange = (field: keyof Goal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.targetValue || formData.targetValue <= 0) {
      newErrors.targetValue = 'Valor da meta deve ser maior que zero'
    }

    if (formData.currentValue < 0) {
      newErrors.currentValue = 'Valor atual não pode ser negativo'
    }

    if (formData.currentValue > formData.targetValue) {
      newErrors.currentValue = 'Valor atual não pode ser maior que a meta'
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Data limite é obrigatória'
    } else {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Data limite não pode ser no passado'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    onSave(formData)
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  const progress = calculateProgress(formData.currentValue, formData.targetValue)
  const progressColor = progress >= 100 ? 'success' : progress >= 75 ? 'info' : progress >= 50 ? 'primary' : progress >= 25 ? 'warning' : 'error'

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {isEditing ? 'Editar Meta' : 'Nova Meta Financeira'}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Preview do Progresso */}
            {formData.targetValue > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview do Progresso
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      color={progressColor}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {progress.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(formData.currentValue)} de {formatCurrency(formData.targetValue)}
                </Typography>
              </Paper>
            )}

            {/* Título */}
            <TextField
              label="Título da Meta"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              required
              fullWidth
              placeholder="Ex: Reserva de Emergência"
            />

            {/* Descrição */}
            <TextField
              label="Descrição"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Descreva sua meta financeira..."
            />

            {/* Valores */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Valor da Meta"
                type="number"
                value={formData.targetValue}
                onChange={(e) => handleChange('targetValue', parseFloat(e.target.value) || 0)}
                error={!!errors.targetValue}
                helperText={errors.targetValue}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="Valor Atual"
                type="number"
                value={formData.currentValue}
                onChange={(e) => handleChange('currentValue', parseFloat(e.target.value) || 0)}
                error={!!errors.currentValue}
                helperText={errors.currentValue}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>

            {/* Data Limite e Categoria */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Data Limite"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                error={!!errors.deadline}
                helperText={errors.deadline}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                select
                label="Categoria"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                fullWidth
              >
                {goalCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Status (apenas ao editar) */}
            {isEditing && (
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                fullWidth
              >
                <MenuItem value="active">Ativa</MenuItem>
                <MenuItem value="completed">Concluída</MenuItem>
                <MenuItem value="paused">Pausada</MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Meta'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
