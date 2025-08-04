import { AppState, AppAction, LoadingState, ErrorState } from '../types'

// Estado inicial
const initialLoadingState: LoadingState = {
  auth: false,
  transactions: false,
  goals: false,
  categories: false,
  sessions: false,
  payments: false,
}

const initialErrorState: ErrorState = {
  auth: null,
  transactions: null,
  goals: null,
  categories: null,
  sessions: null,
  payments: null,
}

export const initialState: AppState = {
  // Autenticação
  user: null,
  isAuthenticated: false,
  isPaid: false,
  
  // Dados
  transactions: [],
  goals: [],
  categories: [],
  sessions: [],
  
  // UI States
  loading: initialLoadingState,
  errors: initialErrorState,
  
  // Configurações
  theme: 'dark',
  sidebarOpen: false,
}

// Reducer principal
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Auth Actions
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      }
    
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      }
    
    case 'SET_PAID_STATUS':
      return {
        ...state,
        isPaid: action.payload,
      }
    
    case 'LOGOUT':
      console.log('🔥 Reducer LOGOUT action executada - resetando estado')
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isPaid: false,
        transactions: [],
        goals: [],
        categories: [],
        sessions: [],
        errors: initialErrorState,
      }
    
    // Transaction Actions
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      }
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      }
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          transaction => transaction.id !== action.payload
        ),
      }
    
    // Goal Actions
    case 'SET_GOALS':
      return {
        ...state,
        goals: action.payload,
      }
    
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [action.payload, ...state.goals],
      }
    
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      }
    
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
      }
    
    // Category Actions
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      }
    
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [action.payload, ...state.categories],
      }
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      }
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(
          category => category.id !== action.payload
        ),
      }
    
    // Session Actions
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
      }
    
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
      }
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
      }
    
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
      }
    
    // Loading Actions
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    
    // Error Actions
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      }
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: initialErrorState,
      }
    
    // UI Actions
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      }
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      }
    
    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload,
      }
    
    default:
      return state
  }
}

// Action creators para facilitar o uso
export const actionCreators = {
  // Auth
  setUser: (user: AppState['user']) => ({ type: 'SET_USER' as const, payload: user }),
  setAuthenticated: (authenticated: boolean) => ({ type: 'SET_AUTHENTICATED' as const, payload: authenticated }),
  setPaidStatus: (isPaid: boolean) => ({ type: 'SET_PAID_STATUS' as const, payload: isPaid }),
  logout: () => ({ type: 'LOGOUT' as const }),
  
  // Transactions
  setTransactions: (transactions: AppState['transactions']) => ({ type: 'SET_TRANSACTIONS' as const, payload: transactions }),
  addTransaction: (transaction: AppState['transactions'][0]) => ({ type: 'ADD_TRANSACTION' as const, payload: transaction }),
  updateTransaction: (transaction: AppState['transactions'][0]) => ({ type: 'UPDATE_TRANSACTION' as const, payload: transaction }),
  deleteTransaction: (id: number) => ({ type: 'DELETE_TRANSACTION' as const, payload: id }),
  
  // Goals
  setGoals: (goals: AppState['goals']) => ({ type: 'SET_GOALS' as const, payload: goals }),
  addGoal: (goal: AppState['goals'][0]) => ({ type: 'ADD_GOAL' as const, payload: goal }),
  updateGoal: (goal: AppState['goals'][0]) => ({ type: 'UPDATE_GOAL' as const, payload: goal }),
  deleteGoal: (id: number) => ({ type: 'DELETE_GOAL' as const, payload: id }),
  
  // Categories
  setCategories: (categories: AppState['categories']) => ({ type: 'SET_CATEGORIES' as const, payload: categories }),
  addCategory: (category: AppState['categories'][0]) => ({ type: 'ADD_CATEGORY' as const, payload: category }),
  updateCategory: (category: AppState['categories'][0]) => ({ type: 'UPDATE_CATEGORY' as const, payload: category }),
  deleteCategory: (id: number) => ({ type: 'DELETE_CATEGORY' as const, payload: id }),
  
  // Sessions
  setSessions: (sessions: AppState['sessions']) => ({ type: 'SET_SESSIONS' as const, payload: sessions }),
  addSession: (session: AppState['sessions'][0]) => ({ type: 'ADD_SESSION' as const, payload: session }),
  updateSession: (session: AppState['sessions'][0]) => ({ type: 'UPDATE_SESSION' as const, payload: session }),
  deleteSession: (id: number) => ({ type: 'DELETE_SESSION' as const, payload: id }),
  
  // Loading
  setLoading: (key: keyof LoadingState, value: boolean) => ({ type: 'SET_LOADING' as const, payload: { key, value } }),
  
  // Errors
  setError: (key: keyof ErrorState, value: string | null) => ({ type: 'SET_ERROR' as const, payload: { key, value } }),
  clearErrors: () => ({ type: 'CLEAR_ERRORS' as const }),
  
  // UI
  setTheme: (theme: 'light' | 'dark') => ({ type: 'SET_THEME' as const, payload: theme }),
  toggleSidebar: () => ({ type: 'TOGGLE_SIDEBAR' as const }),
  setSidebar: (open: boolean) => ({ type: 'SET_SIDEBAR' as const, payload: open }),
}
