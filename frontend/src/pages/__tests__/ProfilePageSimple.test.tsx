import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '../../theme/uber-theme'
import ProfilePageSimple from '../ProfilePageSimple'

// Wrapper com tema Material-UI
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('ProfilePageSimple - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização', () => {
    test('deve renderizar o componente sem erros', () => {
      renderWithTheme(<ProfilePageSimple />)
      expect(screen.getAllByText('João Silva Santos')[0]).toBeInTheDocument()
    })

    test('deve exibir informações básicas do usuário', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getAllByText('João Silva Santos')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Premium')[0]).toBeInTheDocument()
      expect(screen.getByText('Desde 15/01/2024')).toBeInTheDocument()
    })

    test('deve mostrar todas as seções principais', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getByText('Informações Pessoais')).toBeInTheDocument()
      expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument()
      expect(screen.getByText('Informações da Conta')).toBeInTheDocument()
    })

    test('deve exibir dados pessoais corretos', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getAllByText('joao.silva@email.com')[0]).toBeInTheDocument()
      expect(screen.getByText('+55 11 99999-9999')).toBeInTheDocument()
      expect(screen.getByText('Honda Civic 2020 - Prata')).toBeInTheDocument()
    })
  })

  describe('Resumo Financeiro', () => {
    test('deve exibir valores monetários formatados', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getByText('R$ 15.420,50')).toBeInTheDocument() // Total Faturado
      expect(screen.getByText('R$ 8.450,30')).toBeInTheDocument()  // Total Gasto
      expect(screen.getByText('R$ 6.970,20')).toBeInTheDocument()  // Saldo Líquido
    })

    test('deve mostrar labels dos valores financeiros', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getByText('Total Faturado')).toBeInTheDocument()
      expect(screen.getByText('Total Gasto')).toBeInTheDocument()
      expect(screen.getByText('Saldo Líquido')).toBeInTheDocument()
    })

    test('deve calcular saldo líquido corretamente', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      // 15420.50 - 8450.30 = 6970.20
      expect(screen.getByText('R$ 6.970,20')).toBeInTheDocument()
    })
  })

  describe('Funcionalidade de Edição', () => {
    test('deve ter botão de edição visível', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      const editButton = screen.getByRole('button', { name: /editar perfil/i })
      expect(editButton).toBeInTheDocument()
    })

    test('deve abrir modal ao clicar em editar', async () => {
      renderWithTheme(<ProfilePageSimple />)
      
      const editButton = screen.getByRole('button', { name: /editar perfil/i })
      fireEvent.click(editButton)
      
      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })
    })

    test('deve mostrar campos preenchidos no modal', async () => {
      renderWithTheme(<ProfilePageSimple />)
      
      fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }))
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('João Silva Santos')).toBeInTheDocument()
        expect(screen.getByDisplayValue('joao.silva@email.com')).toBeInTheDocument()
        expect(screen.getByDisplayValue('+55 11 99999-9999')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Honda Civic 2020 - Prata')).toBeInTheDocument()
        expect(screen.getByDisplayValue('15/01/2024')).toBeInTheDocument()
      })
    })

    test('deve permitir editar campos', async () => {
      renderWithTheme(<ProfilePageSimple />)
      
      fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByDisplayValue('João Silva Santos')
      fireEvent.change(nameInput, { target: { value: 'João Silva Editado' } })
      
      expect(screen.getByDisplayValue('João Silva Editado')).toBeInTheDocument()
    })

    test('deve salvar alterações', async () => {
      renderWithTheme(<ProfilePageSimple />)
      
      fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByDisplayValue('João Silva Santos')
      fireEvent.change(nameInput, { target: { value: 'Nome Alterado' } })
      
      const saveButton = screen.getByRole('button', { name: /salvar/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument()
      })
      
      expect(screen.getAllByText('Nome Alterado')[0]).toBeInTheDocument()
    })

    test('deve cancelar edição', async () => {
      renderWithTheme(<ProfilePageSimple />)
      
      fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByDisplayValue('João Silva Santos')
      fireEvent.change(nameInput, { target: { value: 'Nome Temporário' } })
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument()
      })
      
      expect(screen.getAllByText('João Silva Santos')[0]).toBeInTheDocument()
      expect(screen.queryByText('Nome Temporário')).not.toBeInTheDocument()
    })
  })

  describe('Avatar e Iniciais', () => {
    test('deve exibir iniciais corretas', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      // João Silva Santos -> JS
      expect(screen.getByText('JS')).toBeInTheDocument()
    })
  })

  describe('Informações da Conta', () => {
    test('deve mostrar tipo de assinatura', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getByText('Tipo de Assinatura')).toBeInTheDocument()
      // Verifica especificamente o Premium na seção de Informações da Conta
      const accountSection = screen.getByText('Informações da Conta').closest('div')
      expect(accountSection).toContainElement(screen.getAllByText('Premium')[1])
    })

    test('deve mostrar data de início', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getByText('Data de Início do Monitoramento')).toBeInTheDocument()
      expect(screen.getByText('15/01/2024')).toBeInTheDocument()
    })

    test('deve mostrar email de contato', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getByText('Email de Contato')).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    test('deve ter roles apropriados', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /informações pessoais/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /resumo financeiro/i })).toBeInTheDocument()
    })

    test('deve permitir foco no botão de edição', () => {
      renderWithTheme(<ProfilePageSimple />)
      
      const editButton = screen.getByRole('button', { name: /editar perfil/i })
      editButton.focus()
      
      expect(document.activeElement).toBe(editButton)
    })
  })
})
