// Mock data para testes do Dashboard
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'João da Silva Teste',
  isPaid: true,
  planStatus: 'active',
  trialEndsAt: null,
  paymentStatus: 'active',
}

export const mockDashboardData = {
  today: {
    income: 287.50,
    expenses: 95.20,
    profit: 192.30,
    trips: 14,
    hours: 8.5,
    efficiency: 85,
  },
  thisWeek: {
    income: 1420.30,
    expenses: 456.80,
    profit: 963.50,
    trips: 73,
    hours: 42,
  },
  goals: {
    dailyTarget: 250,
    weeklyTarget: 1750,
    weeklyKmTarget: 500,
  },
  recentTransactions: [
    {
      id: 1,
      type: 'income' as const,
      amount: 34.50,
      description: 'Corrida Centro → Aeroporto',
      category: 'Uber',
      time: '16:45',
      platform: 'Uber',
    },
    {
      id: 2,
      type: 'income' as const,
      amount: 28.90,
      description: 'Viagem Zona Sul',
      category: '99',
      time: '15:30',
      platform: '99',
    },
    {
      id: 3,
      type: 'expense' as const,
      amount: 85.00,
      description: 'Abastecimento Completo',
      category: 'Combustível',
      time: '14:30',
    },
  ],
  userName: 'João',
  userEmail: 'test@example.com'
}

export const mockAppState = {
  user: mockUser,
  isAuthenticated: true,
  isPaid: true,
  transactions: [],
  goals: [],
  categories: [],
  sessions: [],
  loading: {
    auth: false,
    transactions: false,
    goals: false,
    categories: false,
    sessions: false,
  },
  errors: {
    auth: null,
    transactions: null,
    goals: null,
    categories: null,
    sessions: null,
  },
  theme: 'dark' as const,
  sidebarOpen: false,
}
