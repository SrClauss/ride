import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../theme/uber-theme'
import ProfilePage from '../ProfilePage'

// Wrapper com tema Material-UI
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('ProfilePage - Teste Unitário', () => {
  test('deve renderizar ProfilePageSimple corretamente', () => {
    renderWithTheme(<ProfilePage />)
    
    // Verificar se o ProfilePageSimple foi renderizado usando getAllByText para lidar com duplicatas
    expect(screen.getAllByText('João Silva Santos')[0]).toBeInTheDocument()
    expect(screen.getByText('Informações Pessoais')).toBeInTheDocument()
    expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument()
    expect(screen.getByText('Informações da Conta')).toBeInTheDocument()
  })
})
