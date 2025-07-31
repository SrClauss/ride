'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  Link,
  Divider,
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
import { useApp } from '../../store/context'

export default function LoginPage() {
  const { actions, dispatch } = useApp()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      // Simular login - substituir pela integração real com API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data
      const mockUser = {
        id: 1,
        username: 'driver_demo',
        email: formData.email,
        fullName: 'João Motorista',
        isPaid: true,
        planStatus: 'active' as const,
        trialEndsAt: null,
        paymentStatus: 'paid' as const,
      }

      // Simular token
      const mockToken = 'mock_jwt_token_12345'
      
      dispatch(actions.setUser(mockUser))
      dispatch(actions.setAuthenticated(true))
      
      // Salvar no localStorage
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('userData', JSON.stringify(mockUser))
      
    } catch {
      setError('Erro ao fazer login. Verifique suas credenciais.')
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
          backgroundColor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: '0 auto',
                backgroundColor: 'primary.main',
                mb: 2,
              }}
            >
              <DirectionsCar sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Rider Finance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema financeiro para motoristas de aplicativo
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mb: 2,
                height: 48,
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Link href="#" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Esqueceu sua senha?
              </Link>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{' '}
                <Link href="#" fontWeight={600} underline="hover">
                  Cadastre-se
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Demo Info */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: 'success.light',
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="success.dark" fontWeight={600}>
              DEMO: Use qualquer e-mail e senha para testar
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
