'use client'

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, ReactNode } from 'react'
import { AppState, AppAction, User } from '../types'
import { appReducer, initialState, actionCreators } from './reducer'

// Context type
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  actions: typeof actionCreators
  // Funções helper
  login: (token: string, userData: User) => void
  logout: () => void
  checkAuthStatus: () => void
}

// Criar o context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Exportar o context para testes
export { AppContext }

// Provider component
interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Função de login
  const login = useCallback((token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify(userData))
    }
    
    dispatch(actionCreators.setUser(userData))
    dispatch(actionCreators.setAuthenticated(true))
    
    // Verificar status do plano
    const now = new Date()
    const trialEndsAt = userData.trialEndsAt ? new Date(userData.trialEndsAt) : null
    const isSubscribed = userData.isPaid || 
                        (trialEndsAt && now <= trialEndsAt) || 
                        userData.planStatus === 'active'
    
    dispatch(actionCreators.setPaidStatus(isSubscribed))
  }, [dispatch])

  // Função de logout
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('tempUserId')
      localStorage.removeItem('pendingPaymentUserId')
    }
    
    dispatch(actionCreators.logout())
  }, [dispatch])

  // Verificar status de autenticação
  const checkAuthStatus = useCallback(() => {
    if (typeof window === 'undefined') return

    dispatch(actionCreators.setLoading('auth', true))
    
    try {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData) as User
        
        // Verificar se o token ainda é válido (você pode adicionar validação JWT aqui)
        dispatch(actionCreators.setUser(parsedUser))
        dispatch(actionCreators.setAuthenticated(true))
        
        // Verificar status do plano
        const now = new Date()
        const trialEndsAt = parsedUser.trialEndsAt ? new Date(parsedUser.trialEndsAt) : null
        const isSubscribed = parsedUser.isPaid || 
                            (trialEndsAt && now <= trialEndsAt) || 
                            parsedUser.planStatus === 'active'
        
        dispatch(actionCreators.setPaidStatus(isSubscribed))
      } else {
        dispatch(actionCreators.setAuthenticated(false))
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      // Token ou dados corrompidos, limpar
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      dispatch(actionCreators.setAuthenticated(false))
      dispatch(actionCreators.setError('auth', 'Erro ao verificar autenticação'))
    } finally {
      dispatch(actionCreators.setLoading('auth', false))
    }
  }, [dispatch])

  // Inicializar auth na primeira renderização
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Persistir tema no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && state.theme) {
      localStorage.setItem('theme', state.theme)
      // Aplicar tema no document apenas no cliente
      if (document) {
        document.documentElement.setAttribute('data-theme', state.theme)
      }
    }
  }, [state.theme])

  // Carregar tema do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        dispatch(actionCreators.setTheme(savedTheme))
      } else {
        // Detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const defaultTheme = prefersDark ? 'dark' : 'light'
        dispatch(actionCreators.setTheme(defaultTheme))
      }
    }
  }, [])

  const contextValue: AppContextType = useMemo(() => ({
    state,
    dispatch,
    actions: actionCreators,
    login,
    logout,
    checkAuthStatus,
  }), [state, login, logout, checkAuthStatus])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook para usar o context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider')
  }
  return context
}

// Hooks específicos para facilitar o uso
export function useAuth() {
  const { state, login, logout, checkAuthStatus } = useApp()
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isPaid: state.isPaid,
    isLoading: state.loading.auth,
    error: state.errors.auth,
    login,
    logout,
    checkAuthStatus,
  }
}

export function useTransactions() {
  const { state, dispatch, actions } = useApp()
  return {
    transactions: state.transactions,
    isLoading: state.loading.transactions,
    error: state.errors.transactions,
    setTransactions: (transactions: AppState['transactions']) => 
      dispatch(actions.setTransactions(transactions)),
    addTransaction: (transaction: AppState['transactions'][0]) => 
      dispatch(actions.addTransaction(transaction)),
    updateTransaction: (transaction: AppState['transactions'][0]) => 
      dispatch(actions.updateTransaction(transaction)),
    deleteTransaction: (id: number) => 
      dispatch(actions.deleteTransaction(id)),
    setLoading: (loading: boolean) => 
      dispatch(actions.setLoading('transactions', loading)),
    setError: (error: string | null) => 
      dispatch(actions.setError('transactions', error)),
  }
}

export function useGoals() {
  const { state, dispatch, actions } = useApp()
  return {
    goals: state.goals,
    isLoading: state.loading.goals,
    error: state.errors.goals,
    setGoals: (goals: AppState['goals']) => 
      dispatch(actions.setGoals(goals)),
    addGoal: (goal: AppState['goals'][0]) => 
      dispatch(actions.addGoal(goal)),
    updateGoal: (goal: AppState['goals'][0]) => 
      dispatch(actions.updateGoal(goal)),
    deleteGoal: (id: number) => 
      dispatch(actions.deleteGoal(id)),
    setLoading: (loading: boolean) => 
      dispatch(actions.setLoading('goals', loading)),
    setError: (error: string | null) => 
      dispatch(actions.setError('goals', error)),
  }
}

export function useCategories() {
  const { state, dispatch, actions } = useApp()
  return {
    categories: state.categories,
    isLoading: state.loading.categories,
    error: state.errors.categories,
    setCategories: (categories: AppState['categories']) => 
      dispatch(actions.setCategories(categories)),
    addCategory: (category: AppState['categories'][0]) => 
      dispatch(actions.addCategory(category)),
    updateCategory: (category: AppState['categories'][0]) => 
      dispatch(actions.updateCategory(category)),
    deleteCategory: (id: number) => 
      dispatch(actions.deleteCategory(id)),
    setLoading: (loading: boolean) => 
      dispatch(actions.setLoading('categories', loading)),
    setError: (error: string | null) => 
      dispatch(actions.setError('categories', error)),
  }
}

export function useSessions() {
  const { state, dispatch, actions } = useApp()
  return {
    sessions: state.sessions,
    isLoading: state.loading.sessions,
    error: state.errors.sessions,
    setSessions: (sessions: AppState['sessions']) => 
      dispatch(actions.setSessions(sessions)),
    addSession: (session: AppState['sessions'][0]) => 
      dispatch(actions.addSession(session)),
    updateSession: (session: AppState['sessions'][0]) => 
      dispatch(actions.updateSession(session)),
    deleteSession: (id: number) => 
      dispatch(actions.deleteSession(id)),
    setLoading: (loading: boolean) => 
      dispatch(actions.setLoading('sessions', loading)),
    setError: (error: string | null) => 
      dispatch(actions.setError('sessions', error)),
  }
}

export function useTheme() {
  const { state, dispatch, actions } = useApp()
  return {
    theme: state.theme,
    setTheme: (theme: 'light' | 'dark') => dispatch(actions.setTheme(theme)),
    toggleTheme: () => 
      dispatch(actions.setTheme(state.theme === 'light' ? 'dark' : 'light')),
  }
}

export function useUI() {
  const { state, dispatch, actions } = useApp()
  return {
    sidebarOpen: state.sidebarOpen,
    setSidebar: (open: boolean) => dispatch(actions.setSidebar(open)),
    toggleSidebar: () => dispatch(actions.toggleSidebar()),
  }
}
