'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  Stack,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
  AccountBalanceWallet as WalletIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

export interface UserProfile {
  name: string
  email: string
  phone: string
  vehicle: string
  startDate: string
  totalSpent: number
  totalEarned: number
  accountType: string
}

export default function ProfilePageSimple() {
  const theme = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '+55 11 99999-9999',
    vehicle: 'Honda Civic 2020 - Prata',
    startDate: '15/01/2024',
    totalSpent: 8450.30,
    totalEarned: 15420.50,
    accountType: 'Premium'
  })
  
  const [editForm, setEditForm] = useState<UserProfile>(profile)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleSave = () => {
    setProfile(editForm)
    setIsEditing(false)
    // Aqui você pode adicionar a lógica para salvar no backend
    console.log('Salvando perfil:', editForm)
  }

  const handleCancel = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<BadgeIcon />}
                label={profile.accountType}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip 
                icon={<CalendarIcon />}
                label={`Desde ${profile.startDate}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
          <IconButton
            onClick={() => setIsEditing(true)}
            aria-label="Editar perfil"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Informações Principais */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            Informações Pessoais
          </Typography>
          
          <Stack spacing={3} sx={{ mt: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nome Completo
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {profile.name}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  {profile.email}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Telefone
                </Typography>
                <Typography variant="body1" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  {profile.phone}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Veículo
                </Typography>
                <Typography variant="body1" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CarIcon fontSize="small" color="action" />
                  {profile.vehicle}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WalletIcon color="primary" />
            Resumo Financeiro
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
            gap: 3, 
            mt: 3 
          }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 2
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(profile.totalEarned)}
              </Typography>
              <Typography variant="body2">
                Total Faturado
              </Typography>
            </Paper>
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 2
              }}
            >
              <WalletIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(profile.totalSpent)}
              </Typography>
              <Typography variant="body2">
                Total Gasto
              </Typography>
            </Paper>
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'info.light',
                color: 'info.contrastText',
                borderRadius: 2
              }}
            >
              <WalletIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(profile.totalEarned - profile.totalSpent)}
              </Typography>
              <Typography variant="body2">
                Saldo Líquido
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Informações da Conta
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">
                Tipo de Assinatura
              </Typography>
              <Chip 
                label={profile.accountType}
                color={profile.accountType === 'Premium' ? 'primary' : 'default'}
                variant="outlined"
              />
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">
                Data de Início do Monitoramento
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {profile.startDate}
              </Typography>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">
                Email de Contato
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {profile.email}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog 
        open={isEditing} 
        onClose={handleCancel}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Editar Perfil
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nome Completo"
              fullWidth
              value={editForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              variant="outlined"
            />
            
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={editForm.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              variant="outlined"
            />
            
            <TextField
              label="Telefone"
              fullWidth
              value={editForm.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              variant="outlined"
            />
            
            <TextField
              label="Veículo"
              fullWidth
              value={editForm.vehicle}
              onChange={(e) => handleInputChange('vehicle', e.target.value)}
              variant="outlined"
            />
            
            <TextField
              label="Data de Início"
              fullWidth
              value={editForm.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              variant="outlined"
              helperText="Formato: DD/MM/AAAA"
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCancel} 
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
