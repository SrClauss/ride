// Mock data para testes dos componentes de Transações

export const mockTransactions = [
  {
    id: 1,
    description: 'Corrida Uber - Centro → Aeroporto',
    amount: 45.50,
    type: 'income' as const,
    category: 'Uber',
    date: '2025-07-30',
    time: '16:45',
    status: 'completed' as const,
    platform: 'Uber',
    location: 'São Paulo, SP'
  },
  {
    id: 2,
    description: 'Corrida 99 - Shopping para Casa',
    amount: 28.75,
    type: 'income' as const,
    category: '99',
    date: '2025-07-30',
    time: '15:30',
    status: 'completed' as const,
    platform: '99',
    location: 'São Paulo, SP'
  },
  {
    id: 3,
    description: 'Corrida InDriver - Trabalho',
    amount: 35.00,
    type: 'income' as const,
    category: 'InDriver',
    date: '2025-07-30',
    time: '14:15',
    status: 'completed' as const,
    platform: 'InDriver',
    location: 'São Paulo, SP'
  },
  {
    id: 4,
    description: 'Abastecimento Completo',
    amount: 120.00,
    type: 'expense' as const,
    category: 'Combustível',
    date: '2025-07-30',
    time: '13:15',
    status: 'completed' as const,
    location: 'Posto Shell'
  },
  {
    id: 5,
    description: 'Almoço',
    amount: 25.50,
    type: 'expense' as const,
    category: 'Alimentação',
    date: '2025-07-30',
    time: '12:30',
    status: 'completed' as const,
    location: 'Restaurante ABC'
  },
  {
    id: 6,
    description: 'Café da Manhã',
    amount: 8.90,
    type: 'expense' as const,
    category: 'Café',
    date: '2025-07-30',
    time: '08:15',
    status: 'completed' as const,
    location: 'Padaria Central'
  }
]

export const mockFilters = {
  type: 'all' as 'all' | 'income' | 'expense',
  category: 'all' as string,
  dateRange: {
    start: '2025-07-01',
    end: '2025-07-31'
  },
  status: 'all' as 'all' | 'completed' | 'pending',
  platform: 'all' as string
}

export const mockTransactionFormData = {
  description: 'Nova Transação Teste',
  amount: 50.00,
  type: 'income' as const,
  category: 'Uber',
  date: '2025-07-30',
  time: '18:00',
  status: 'completed' as const,
  platform: 'Uber',
  location: 'São Paulo, SP'
}

export const mockCategories = {
  income: ['Uber', '99', 'InDriver', 'Cabify'],
  expense: ['Combustível', 'Alimentação', 'Telefone', 'Café', 'Compras', 'Manutenção']
}

export const mockPlatforms = ['Uber', '99', 'InDriver', 'Cabify']

// Estado mock para o contexto da aplicação
export const mockAppStateTransactions = {
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'João da Silva Teste',
    isPaid: true,
    planStatus: 'active',
    trialEndsAt: null,
    paymentStatus: 'active',
  },
  isAuthenticated: true,
  theme: 'dark' as const,
  sidebarOpen: false,
  dashboardData: {
    today: {
      income: 86.15,
      expenses: 119.40,
      profit: -33.25,
      trips: 3,
      hours: 4.5,
      efficiency: 75,
    },
    thisWeek: {
      income: 602.05,
      expenses: 836.80,
      profit: -234.75,
      trips: 21,
      hours: 31.5,
    },
  },
  transactions: mockTransactions,
  goals: {
    dailyTarget: 250,
    weeklyTarget: 1750,
  }
}
