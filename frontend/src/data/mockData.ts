/**
 * Mock data compatible with the real API structure
 * Based on the backend schemas and models
 */

export interface MockTransaction {
  id: string
  id_usuario: string
  id_categoria: string
  valor: number
  descricao: string
  tipo: 'receita' | 'despesa'
  data: string
  origem?: string
  id_externo?: string
  plataforma?: string
  observacoes?: string
  tags?: string
  criado_em: string
  nome_categoria: string
}

export interface MockDashboardData {
  // Dados de hoje
  ganhos_hoje: number
  gastos_hoje: number
  lucro_hoje: number
  corridas_hoje: number
  horas_hoje: number
  eficiencia: number
  
  // Dados da semana
  ganhos_semana: number
  gastos_semana: number
  lucro_semana: number
  corridas_semana: number
  horas_semana: number
  
  // Metas
  meta_diaria: number
  meta_semanal: number
  
  // Tendências
  tendencia_ganhos: number
  tendencia_gastos: number
  tendencia_corridas: number
}

export interface MockCategory {
  id: string
  id_usuario: string
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
  eh_ativa: boolean
  criado_em: string
}

// Mock Categories
export const mockCategories: MockCategory[] = [
  {
    id: "cat-1",
    id_usuario: "user-1",
    nome: "Uber",
    tipo: "receita",
    cor: "#000000",
    eh_ativa: true,
    criado_em: "2024-01-01T00:00:00Z"
  },
  {
    id: "cat-2", 
    id_usuario: "user-1",
    nome: "99",
    tipo: "receita",
    cor: "#FFD700",
    eh_ativa: true,
    criado_em: "2024-01-01T00:00:00Z"
  },
  {
    id: "cat-3",
    id_usuario: "user-1", 
    nome: "Combustível",
    tipo: "despesa",
    cor: "#FF4444",
    eh_ativa: true,
    criado_em: "2024-01-01T00:00:00Z"
  },
  {
    id: "cat-4",
    id_usuario: "user-1",
    nome: "Manutenção",
    tipo: "despesa", 
    cor: "#FF8800",
    eh_ativa: true,
    criado_em: "2024-01-01T00:00:00Z"
  },
  {
    id: "cat-5",
    id_usuario: "user-1",
    nome: "iFood",
    tipo: "receita",
    cor: "#EA1E2C",
    eh_ativa: true,
    criado_em: "2024-01-01T00:00:00Z"
  }
]

// Mock Transactions
export const mockTransactions: MockTransaction[] = [
  {
    id: "trans-1",
    id_usuario: "user-1",
    id_categoria: "cat-1",
    valor: 45.50,
    descricao: "Corrida Uber - Centro para Aeroporto",
    tipo: "receita",
    data: "2024-07-30T16:45:00Z",
    origem: "app",
    plataforma: "uber",
    observacoes: "Corrida longa, cliente educado",
    tags: "aeroporto,longa",
    criado_em: "2024-07-30T16:45:00Z",
    nome_categoria: "Uber"
  },
  {
    id: "trans-2", 
    id_usuario: "user-1",
    id_categoria: "cat-2",
    valor: 28.75,
    descricao: "Corrida 99 - Shopping para Casa",
    tipo: "receita",
    data: "2024-07-30T15:30:00Z",
    origem: "app",
    plataforma: "99",
    observacoes: "Trânsito intenso",
    tags: "shopping,residencial",
    criado_em: "2024-07-30T15:30:00Z",
    nome_categoria: "99"
  },
  {
    id: "trans-3",
    id_usuario: "user-1", 
    id_categoria: "cat-3",
    valor: 85.00,
    descricao: "Abastecimento Completo",
    tipo: "despesa",
    data: "2024-07-30T12:30:00Z",
    origem: "manual",
    observacoes: "Posto Shell - Tanque cheio",
    tags: "combustivel,posto",
    criado_em: "2024-07-30T12:30:00Z",
    nome_categoria: "Combustível"
  },
  {
    id: "trans-4",
    id_usuario: "user-1",
    id_categoria: "cat-1", 
    valor: 52.30,
    descricao: "Corrida Uber - Hospital para Centro",
    tipo: "receita",
    data: "2024-07-30T11:15:00Z",
    origem: "app",
    plataforma: "uber",
    observacoes: "Passageiro idoso, ajudei com bagagem",
    tags: "hospital,centro,ajuda",
    criado_em: "2024-07-30T11:15:00Z",
    nome_categoria: "Uber"
  },
  {
    id: "trans-5",
    id_usuario: "user-1",
    id_categoria: "cat-5",
    valor: 18.90,
    descricao: "Delivery iFood - Restaurante Italiano",
    tipo: "receita", 
    data: "2024-07-30T10:20:00Z",
    origem: "app",
    plataforma: "ifood",
    observacoes: "Delivery rápido, cliente próximo",
    tags: "delivery,ifood,proximo",
    criado_em: "2024-07-30T10:20:00Z",
    nome_categoria: "iFood"
  },
  {
    id: "trans-6",
    id_usuario: "user-1",
    id_categoria: "cat-2",
    valor: 34.20,
    descricao: "Corrida 99 - Universidade para Shopping",
    tipo: "receita",
    data: "2024-07-30T09:45:00Z", 
    origem: "app",
    plataforma: "99",
    observacoes: "Estudante, conversa boa",
    tags: "universidade,shopping,estudante",
    criado_em: "2024-07-30T09:45:00Z",
    nome_categoria: "99"
  },
  {
    id: "trans-7",
    id_usuario: "user-1",
    id_categoria: "cat-4",
    valor: 45.00,
    descricao: "Troca de Óleo",
    tipo: "despesa",
    data: "2024-07-29T16:00:00Z",
    origem: "manual", 
    observacoes: "Manutenção preventiva - Oficina do João",
    tags: "oleo,manutencao,preventiva",
    criado_em: "2024-07-29T16:00:00Z",
    nome_categoria: "Manutenção"
  },
  {
    id: "trans-8",
    id_usuario: "user-1",
    id_categoria: "cat-1",
    valor: 67.80,
    descricao: "Corrida Uber - Aeroporto para Hotel",
    tipo: "receita",
    data: "2024-07-29T14:30:00Z",
    origem: "app",
    plataforma: "uber",
    observacoes: "Turista estrangeiro, gorjeta extra",
    tags: "aeroporto,hotel,turista,gorjeta",
    criado_em: "2024-07-29T14:30:00Z",
    nome_categoria: "Uber"
  }
]

// Mock Dashboard Data  
export const mockDashboardData: MockDashboardData = {
  // Dados de hoje
  ganhos_hoje: 287.50,
  gastos_hoje: 95.20,
  lucro_hoje: 192.30,
  corridas_hoje: 14,
  horas_hoje: 8.5,
  eficiencia: 85,
  
  // Dados da semana
  ganhos_semana: 1420.30,
  gastos_semana: 456.80,
  lucro_semana: 963.50,
  corridas_semana: 73,
  horas_semana: 42,
  
  // Metas
  meta_diaria: 250.00,
  meta_semanal: 1750.00,
  
  // Tendências (porcentagem)
  tendencia_ganhos: 12.5,
  tendencia_gastos: -8.2,
  tendencia_corridas: 15.3
}

// Transaction Summary Mock
export const mockTransactionSummary = {
  total_receitas: 1420.30,
  total_despesas: 456.80,
  saldo: 963.50,
  count_receitas: 62,
  count_despesas: 11,
  total_transacoes: 73
}

// Daily transactions mock
export const mockDailyTransactions = [
  {
    data: "2024-07-30",
    receitas: 287.50,
    despesas: 95.20,
    saldo: 192.30,
    count_receitas: 12,
    count_despesas: 2,
    total_transacoes: 14
  },
  {
    data: "2024-07-29", 
    receitas: 245.80,
    despesas: 125.00,
    saldo: 120.80,
    count_receitas: 10,
    count_despesas: 3,
    total_transacoes: 13
  },
  {
    data: "2024-07-28",
    receitas: 320.15,
    despesas: 78.50,
    saldo: 241.65,
    count_receitas: 15,
    count_despesas: 2,
    total_transacoes: 17
  }
]

// API Response format simulation
export const createMockApiResponse = <T>(data: T, total?: number) => {
  return {
    success: true,
    data,
    ...(total !== undefined && { 
      pagination: {
        total,
        page: 1,
        per_page: 50,
        pages: Math.ceil(total / 50)
      }
    }),
    message: "Dados obtidos com sucesso"
  }
}

// Simulate API delay
export const mockApiDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
