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
  user: {
    id: 1,
    username: 'motorista123',
    email: 'motorista@exemplo.com',
    fullName: 'João Motorista',
    isPaid: true,
    planStatus: 'active',
    trialEndsAt: null,
    paymentStatus: 'paid',
  },
  isAuthenticated: true,
  isPaid: true,
  loading: {
    auth: false,
    transactions: false,
    goals: false,
    categories: false,
    sessions: false,
    payments: false,
  },
  errors: {
    auth: null,
    transactions: null,
    goals: null,
    categories: null,
    sessions: null,
    payments: null,
  },
  theme: 'dark' as const,
  transactions: [
    {
      id: 1,
      userId: 1,
      descricao: 'Corrida Uber - Centro para Aeroporto',
      valor: 45.50,
      tipo: 'receita' as const,
      categoria: 'Uber',
      data: '2024-01-15',
      createdAt: '2024-01-15T16:45:00Z',
      updatedAt: '2024-01-15T16:45:00Z'
    },
    {
      id: 2,
      userId: 1,
      descricao: 'Corrida 99 - Shopping para Casa',
      valor: 28.75,
      tipo: 'receita' as const,
      categoria: '99',
      data: '2024-01-15',
      createdAt: '2024-01-15T15:30:00Z',
      updatedAt: '2024-01-15T15:30:00Z'
    },
    {
      id: 3,
      userId: 1,
      descricao: 'Abastecimento Completo',
      valor: 85.00,
      tipo: 'despesa' as const,
      categoria: 'Combustível',
      data: '2024-01-15',
      createdAt: '2024-01-15T12:30:00Z',
      updatedAt: '2024-01-15T12:30:00Z'
    }
  ],
  goals: [
    {
      id: 1,
      userId: 1,
      titulo: 'Meta Diária',
      descricao: 'Ganho diário de condução',
      valorAlvo: 250,
      valorAtual: 287.50,
      dataAlvo: '2024-01-15',
      ativa: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T16:45:00Z'
    },
    {
      id: 2,
      userId: 1,
      titulo: 'Meta Semanal',
      descricao: 'Ganho semanal de condução',
      valorAlvo: 1750,
      valorAtual: 1420.30,
      dataAlvo: '2024-01-21',
      ativa: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T16:45:00Z'
    }
  ],
  categories: [
    {
      id: 1,
      userId: 1,
      nome: 'Uber',
      tipo: 'receita' as const,
      cor: '#000000',
      icone: 'car',
      ativa: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      nome: '99',
      tipo: 'receita' as const,
      cor: '#FFD700',
      icone: 'car',
      ativa: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      userId: 1,
      nome: 'Combustível',
      tipo: 'despesa' as const,
      cor: '#FF0000',
      icone: 'gas-pump',
      ativa: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  sessions: [
    {
      id: 1,
      userId: 1,
      tipo: 'trabalho' as const,
      descricao: 'Sessão de trabalho diurna',
      dataInicio: '2024-01-15T08:00:00Z',
      dataFim: '2024-01-15T17:00:00Z',
      duracao: 540, // 9 horas em minutos
      ativa: false,
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T17:00:00Z'
    }
  ],
  sidebarOpen: false,
}
