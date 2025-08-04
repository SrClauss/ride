'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  DirectionsCar,
} from '@mui/icons-material'
import { api } from '../../services/api'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: 'demo@riderfinance.com',
    password: 'demo123',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', {
        login: formData.email,
        senha: formData.password
      })

      if (response.data.success) {
        // Salvar token no localStorage
        localStorage.setItem('authToken', response.data.data.tokens.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
        
        // Redirecionar para o dashboard
        router.push('/')
      } else {
        setError(response.data.message || 'Erro no login')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail?.[0]?.msg || err.message || 'Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: '#1C1C1E',
          border: '1px solid #2C2C2E',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: '#20C997',
                mx: 'auto',
                mb: 2,
              }}
            >
              <DirectionsCar sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
              Rider Finance
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93', mt: 1 }}>
              Seu assistente financeiro para motoristas
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled={isLoading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#8E8E93' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: '#2C2C2E',
                  '& input': { color: '#FFFFFF' },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3C3C3E',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20C997',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20C997',
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: '#8E8E93' },
              }}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              value={formData.password}
              onChange={handleChange('password')}
              required
              disabled={isLoading}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#8E8E93' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#8E8E93' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: '#2C2C2E',
                  '& input': { color: '#FFFFFF' },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3C3C3E',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20C997',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20C997',
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: '#8E8E93' },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                backgroundColor: '#20C997',
                '&:hover': {
                  backgroundColor: '#1BA085',
                },
                '&:disabled': {
                  backgroundColor: '#2C2C2E',
                  color: '#8E8E93',
                },
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          {/* Demo Info */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: '#63E6BE',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#20C997' }}>
              Credenciais Demo - Sistema Real
            </Typography>
            <Typography variant="body2" sx={{ color: '#1BA085', mt: 0.5 }}>
              Email: demo@riderfinance.com
            </Typography>
            <Typography variant="body2" sx={{ color: '#1BA085' }}>
              Senha: demo123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
