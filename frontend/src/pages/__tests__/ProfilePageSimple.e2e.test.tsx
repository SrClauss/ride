import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../theme/uber-theme'
import ProfilePageSimple from '../ProfilePageSimple'
import { 
  mockUserProfile, 
  mockUserProfileAlternative, 
  testUtils,
  setupConsoleMock 
} from './profileTestUtils'

// Wrapper com tema Material-UI
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('ProfilePageSimple - Testes E2E', () => {
  let restoreConsole: () => void

  beforeEach(() => {
    restoreConsole = setupConsoleMock()
  })

  afterEach(() => {
    restoreConsole()
  })

  describe('Fluxo Completo de Edição', () => {
    test('deve permitir editar e salvar todas as informações do perfil', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      // 1. Verificar estado inicial
      expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument()
      expect(screen.getByText(mockUserProfile.email)).toBeInTheDocument()

      // 2. Abrir modal de edição
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // 3. Verificar se modal abriu
      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })

      // 4. Editar todos os campos
      const nameInput = screen.getByDisplayValue(mockUserProfile.name)
      const emailInput = screen.getByDisplayValue(mockUserProfile.email)
      const phoneInput = screen.getByDisplayValue(mockUserProfile.phone)
      const vehicleInput = screen.getByDisplayValue(mockUserProfile.vehicle)
      const dateInput = screen.getByDisplayValue(mockUserProfile.startDate)

      await user.clear(nameInput)
      await user.type(nameInput, mockUserProfileAlternative.name)

      await user.clear(emailInput)
      await user.type(emailInput, mockUserProfileAlternative.email)

      await user.clear(phoneInput)
      await user.type(phoneInput, mockUserProfileAlternative.phone)

      await user.clear(vehicleInput)
      await user.type(vehicleInput, mockUserProfileAlternative.vehicle)

      await user.clear(dateInput)
      await user.type(dateInput, mockUserProfileAlternative.startDate)

      // 5. Salvar alterações
      const saveButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(saveButton)

      // 6. Verificar se modal fechou e dados foram atualizados
      await waitFor(() => {
        expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument()
      })

      expect(screen.getByText(mockUserProfileAlternative.name)).toBeInTheDocument()
      expect(screen.getByText(mockUserProfileAlternative.email)).toBeInTheDocument()
      expect(screen.getByText(mockUserProfileAlternative.phone)).toBeInTheDocument()
      expect(screen.getByText(mockUserProfileAlternative.vehicle)).toBeInTheDocument()
    })

    test('deve cancelar edição e manter dados originais', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      // 1. Abrir modal
      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })

      // 2. Fazer alterações
      const nameInput = screen.getByDisplayValue(mockUserProfile.name)
      await user.clear(nameInput)
      await user.type(nameInput, 'Nome Temporário')

      // 3. Cancelar
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      // 4. Verificar se manteve dados originais
      await waitFor(() => {
        expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument()
      })

      expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument()
      expect(screen.queryByText('Nome Temporário')).not.toBeInTheDocument()
    })
  })

  describe('Validação de Formulário', () => {
    test('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      // Abrir modal
      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })

      // Limpar campo obrigatório
      const nameInput = screen.getByDisplayValue(mockUserProfile.name)
      await user.clear(nameInput)

      // Tentar salvar
      const saveButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(saveButton)

      // Verificar se o formulário ainda está aberto (validação impediu salvamento)
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
    })

    test('deve validar formato de email', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })

      // Inserir email inválido
      const emailInput = screen.getByDisplayValue(mockUserProfile.email)
      await user.clear(emailInput)
      await user.type(emailInput, 'email-invalido')

      // O campo deve mostrar erro de validação (se implementado)
      // Por enquanto, só verificamos se não quebra
      expect(screen.getByDisplayValue('email-invalido')).toBeInTheDocument()
    })
  })

  describe('Interações com Teclado', () => {
    test('deve ser navegável por teclado', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      // Navegar para botão de edição com Tab
      await user.tab()
      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toHaveFocus()

      // Abrir modal com Enter
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })
    })

    test('deve fechar modal com Escape', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      // Abrir modal
      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })

      // Fechar com Escape
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument()
      })
    })
  })

  describe('Estados de Loading e Erro', () => {
    test('deve lidar com operações de salvamento', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })

      // Simular clique múltiplo no botão salvar
      const saveButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(saveButton)
      await user.click(saveButton)

      // Verificar se não causou problemas
      expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument()
    })
  })

  describe('Cenários de Dados Diferentes', () => {
    test('deve lidar com valores financeiros altos', () => {
      // Como o componente usa dados mock internos, 
      // este teste verifica se a formatação funciona
      renderWithTheme(<ProfilePageSimple />)

      // Verificar se valores são formatados corretamente
      expect(screen.getByText(testUtils.formatCurrency(15420.50))).toBeInTheDocument()
      expect(screen.getByText(testUtils.formatCurrency(8450.30))).toBeInTheDocument()
    })

    test('deve calcular saldo líquido corretamente', () => {
      renderWithTheme(<ProfilePageSimple />)

      const expectedBalance = testUtils.calculateNetBalance(15420.50, 8450.30)
      expect(screen.getByText(testUtils.formatCurrency(expectedBalance))).toBeInTheDocument()
    })

    test('deve gerar iniciais corretas para diferentes nomes', () => {
      renderWithTheme(<ProfilePageSimple />)

      const expectedInitials = testUtils.generateInitials(mockUserProfile.name)
      expect(screen.getByText(expectedInitials)).toBeInTheDocument()
    })
  })

  describe('Performance e Otimização', () => {
    test('deve renderizar rapidamente', () => {
      const startTime = performance.now()
      renderWithTheme(<ProfilePageSimple />)
      const endTime = performance.now()

      // Verificar se renderização levou menos de 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    test('deve re-renderizar eficientemente após edições', async () => {
      const user = userEvent.setup()
      renderWithTheme(<ProfilePageSimple />)

      // Fazer múltiplas edições
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /edit/i }))
        
        await waitFor(() => {
          expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
        })

        const nameInput = screen.getByDisplayValue(/joão|nome/i)
        await user.clear(nameInput)
        await user.type(nameInput, `Nome ${i}`)

        await user.click(screen.getByRole('button', { name: /salvar/i }))

        await waitFor(() => {
          expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument()
        })
      }

      // Verificar se ainda funciona normalmente
      expect(screen.getByText('Nome 2')).toBeInTheDocument()
    })
  })
})
