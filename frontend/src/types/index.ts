// Tipos base da aplicação
export interface User {
  id: number
  username: string
  email: string | null
  fullName: string | null
  isPaid: boolean
  planStatus: string
  trialEndsAt: string | null
  paymentStatus: string
}

export interface Transaction {
  id: number
  userId: number
  tipo: 'receita' | 'despesa'
  valor: number
  descricao: string
  categoria: string
  data: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: number
  userId: number
  titulo: string
  descricao: string | null
  valorAlvo: number
  valorAtual: number
  dataAlvo: string
  ativa: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  userId: number
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
  icone: string | null
  ativa: boolean
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: number
  userId: number
  tipo: 'trabalho' | 'estudo' | 'pessoal'
  descricao: string | null
  dataInicio: string
  dataFim: string | null
  duracao: number | null
  ativa: boolean
  createdAt: string
  updatedAt: string
}

// Estados de loading e error
export interface LoadingState {
  auth: boolean
  transactions: boolean
  goals: boolean
  categories: boolean
  sessions: boolean
  payments: boolean
}

export interface ErrorState {
  auth: string | null
  transactions: string | null
  goals: string | null
  categories: string | null
  sessions: string | null
  payments: string | null
}

// Estado global da aplicação
export interface AppState {
  // Autenticação
  user: User | null
  isAuthenticated: boolean
  isPaid: boolean
  
  // Dados
  transactions: Transaction[]
  goals: Goal[]
  categories: Category[]
  sessions: Session[]
  
  // UI States
  loading: LoadingState
  errors: ErrorState
  
  // Configurações
  theme: 'light' | 'dark'
  sidebarOpen: boolean
}

// Actions para useReducer
export type AppAction =
  // Auth Actions
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_PAID_STATUS'; payload: boolean }
  | { type: 'LOGOUT' }
  
  // Data Actions
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: number }
  
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: number }
  
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: number }
  
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: Session }
  | { type: 'DELETE_SESSION'; payload: number }
  
  // Loading Actions
  | { type: 'SET_LOADING'; payload: { key: keyof LoadingState; value: boolean } }
  
  // Error Actions
  | { type: 'SET_ERROR'; payload: { key: keyof ErrorState; value: string | null } }
  | { type: 'CLEAR_ERRORS' }
  
  // UI Actions
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }

// Form types para validação
export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export interface TransactionForm {
  tipo: 'receita' | 'despesa'
  valor: string
  descricao: string
  categoria: string
  data: string
}

export interface GoalForm {
  titulo: string
  descricao: string
  valorAlvo: string
  dataAlvo: string
}

export interface CategoryForm {
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
  icone: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filtros e queries
export interface TransactionFilters {
  tipo?: 'receita' | 'despesa'
  categoria?: string
  dataInicio?: string
  dataFim?: string
  ordenarPor?: 'data' | 'valor' | 'descricao'
  ordem?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface GoalFilters {
  ativa?: boolean
  ordenarPor?: 'dataAlvo' | 'valorAlvo' | 'progresso'
  ordem?: 'asc' | 'desc'
}

// Estatísticas e relatórios
export interface TransactionSummary {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  periodo: string
}

export interface GoalProgress {
  goalId: number
  progresso: number
  percentual: number
  faltam: number
  diasRestantes: number
  status: 'em_andamento' | 'concluida' | 'atrasada'
}

export interface DashboardStats {
  transactionSummary: TransactionSummary
  goalProgress: GoalProgress[]
  recentTransactions: Transaction[]
  activeSessions: Session[]
}
