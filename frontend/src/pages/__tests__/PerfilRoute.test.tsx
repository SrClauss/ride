import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../theme/uber-theme'
import PerfilPage from '../../app/perfil/page'

// Mock do ProfilePage
jest.mock('../../pages/ProfilePage', () => {
  return function MockProfilePage() {
    return <div data-testid="profile-page">Profile Page Component</div>
  }
})

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('PerfilPage (Route)', () => {
  test('deve renderizar o componente ProfilePage', () => {
    renderWithTheme(<PerfilPage />)
    
    expect(screen.getByTestId('profile-page')).toBeInTheDocument()
    expect(screen.getByText('Profile Page Component')).toBeInTheDocument()
  })

  test('deve estar acessível via rota /perfil', () => {
    renderWithTheme(<PerfilPage />)
    
    // Verificar que o componente é renderizado sem erros
    expect(screen.getByTestId('profile-page')).toBeInTheDocument()
  })
})
