import { UserProfile } from '../ProfilePageSimple'

/**
 * Dados mock para testes do perfil
 */
export const mockUserProfile: UserProfile = {
  name: 'João Silva Santos',
  email: 'joao.silva@email.com',
  phone: '+55 11 99999-9999',
  vehicle: 'Honda Civic 2020 - Prata',
  startDate: '15/01/2024',
  totalSpent: 8450.30,
  totalEarned: 15420.50,
  accountType: 'Premium'
}

/**
 * Dados mock alternativos para testes
 */
export const mockUserProfileAlternative: UserProfile = {
  name: 'Maria Santos',
  email: 'maria.santos@email.com',
  phone: '+55 11 88888-8888',
  vehicle: 'Toyota Corolla 2021 - Branco',
  startDate: '01/03/2024',
  totalSpent: 5200.00,
  totalEarned: 12800.75,
  accountType: 'Gratuito'
}

/**
 * Dados mock com valores zerados
 */
export const mockUserProfileEmpty: UserProfile = {
  name: 'Usuário Novo',
  email: 'novo@email.com',
  phone: '+55 11 77777-7777',
  vehicle: 'A definir',
  startDate: '01/08/2025',
  totalSpent: 0,
  totalEarned: 0,
  accountType: 'Gratuito'
}

/**
 * Utilitários para testes
 */
export const testUtils = {
  /**
   * Formata valor monetário no padrão brasileiro
   */
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  },

  /**
   * Calcula saldo líquido
   */
  calculateNetBalance: (earned: number, spent: number): number => {
    return earned - spent
  },

  /**
   * Gera iniciais do nome
   */
  generateInitials: (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2)
  },

  /**
   * Selectors comuns para testes
   */
  selectors: {
    headerName: 'João Silva Santos',
    editButton: /edit/i,
    saveButton: /salvar/i,
    cancelButton: /cancelar/i,
    modalTitle: 'Editar Perfil',
    sections: {
      personalInfo: 'Informações Pessoais',
      financialSummary: 'Resumo Financeiro',
      accountInfo: 'Informações da Conta'
    },
    financialLabels: {
      totalEarned: 'Total Faturado',
      totalSpent: 'Total Gasto',
      netBalance: 'Saldo Líquido'
    }
  }
}

/**
 * Funções helper para interação com formulários
 */
export const formHelpers = {
  /**
   * Preenche todos os campos do formulário
   */
  fillForm: (profile: UserProfile) => {
    // Retorna objeto com os valores para preencher
    return {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      vehicle: profile.vehicle,
      startDate: profile.startDate
    }
  },

  /**
   * Valida se os campos estão preenchidos corretamente
   */
  validateFormFields: (expectedProfile: UserProfile) => {
    return {
      name: expectedProfile.name,
      email: expectedProfile.email,
      phone: expectedProfile.phone,
      vehicle: expectedProfile.vehicle,
      startDate: expectedProfile.startDate
    }
  }
}

/**
 * Mock de console.log para testes
 */
export const mockConsoleLog = jest.fn()

/**
 * Setup para testes que precisam de console.log mockado
 */
export const setupConsoleMock = () => {
  const originalConsoleLog = console.log
  console.log = mockConsoleLog
  
  return () => {
    console.log = originalConsoleLog
    mockConsoleLog.mockClear()
  }
}
