import { appReducer, initialState, actionCreators } from '../reducer'
import { AppState } from '../../types'

describe('appReducer', () => {
  describe('Auth Actions', () => {
    it('should set user and authenticate when SET_USER is dispatched', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        isPaid: true,
        planStatus: 'active',
        trialEndsAt: null,
        paymentStatus: 'paid',
      }

      const action = actionCreators.setUser(user)
      const newState = appReducer(initialState, action)

      expect(newState.user).toEqual(user)
      expect(newState.isAuthenticated).toBe(true)
    })

    it('should clear user and unauthenticate when SET_USER is dispatched with null', () => {
      const stateWithUser: AppState = {
        ...initialState,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
          isPaid: true,
          planStatus: 'active',
          trialEndsAt: null,
          paymentStatus: 'paid',
        },
        isAuthenticated: true,
      }

      const action = actionCreators.setUser(null)
      const newState = appReducer(stateWithUser, action)

      expect(newState.user).toBe(null)
      expect(newState.isAuthenticated).toBe(false)
    })

    it('should set paid status', () => {
      const action = actionCreators.setPaidStatus(true)
      const newState = appReducer(initialState, action)

      expect(newState.isPaid).toBe(true)
    })

    it('should logout and clear all data', () => {
      const stateWithData: AppState = {
        ...initialState,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
          isPaid: true,
          planStatus: 'active',
          trialEndsAt: null,
          paymentStatus: 'paid',
        },
        isAuthenticated: true,
        isPaid: true,
        transactions: [
          {
            id: 1,
            userId: 1,
            tipo: 'receita',
            valor: 100,
            descricao: 'Test',
            categoria: 'Test',
            data: '2025-01-01',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ],
      }

      const action = actionCreators.logout()
      const newState = appReducer(stateWithData, action)

      expect(newState.user).toBe(null)
      expect(newState.isAuthenticated).toBe(false)
      expect(newState.isPaid).toBe(false)
      expect(newState.transactions).toEqual([])
    })
  })

  describe('Transaction Actions', () => {
    it('should set transactions', () => {
      const transactions = [
        {
          id: 1,
          userId: 1,
          tipo: 'receita' as const,
          valor: 100,
          descricao: 'Test',
          categoria: 'Test',
          data: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ]

      const action = actionCreators.setTransactions(transactions)
      const newState = appReducer(initialState, action)

      expect(newState.transactions).toEqual(transactions)
    })

    it('should add transaction', () => {
      const transaction = {
        id: 1,
        userId: 1,
        tipo: 'receita' as const,
        valor: 100,
        descricao: 'Test',
        categoria: 'Test',
        data: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const action = actionCreators.addTransaction(transaction)
      const newState = appReducer(initialState, action)

      expect(newState.transactions).toContain(transaction)
      expect(newState.transactions).toHaveLength(1)
    })

    it('should update transaction', () => {
      const originalTransaction = {
        id: 1,
        userId: 1,
        tipo: 'receita' as const,
        valor: 100,
        descricao: 'Original',
        categoria: 'Test',
        data: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const stateWithTransaction: AppState = {
        ...initialState,
        transactions: [originalTransaction],
      }

      const updatedTransaction = {
        ...originalTransaction,
        descricao: 'Updated',
      }

      const action = actionCreators.updateTransaction(updatedTransaction)
      const newState = appReducer(stateWithTransaction, action)

      expect(newState.transactions[0].descricao).toBe('Updated')
    })

    it('should delete transaction', () => {
      const transaction = {
        id: 1,
        userId: 1,
        tipo: 'receita' as const,
        valor: 100,
        descricao: 'Test',
        categoria: 'Test',
        data: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const stateWithTransaction: AppState = {
        ...initialState,
        transactions: [transaction],
      }

      const action = actionCreators.deleteTransaction(1)
      const newState = appReducer(stateWithTransaction, action)

      expect(newState.transactions).toHaveLength(0)
    })
  })

  describe('Loading Actions', () => {
    it('should set loading state for specific key', () => {
      const action = actionCreators.setLoading('transactions', true)
      const newState = appReducer(initialState, action)

      expect(newState.loading.transactions).toBe(true)
      expect(newState.loading.auth).toBe(false) // outros não devem mudar
    })
  })

  describe('Error Actions', () => {
    it('should set error for specific key', () => {
      const action = actionCreators.setError('auth', 'Login failed')
      const newState = appReducer(initialState, action)

      expect(newState.errors.auth).toBe('Login failed')
      expect(newState.errors.transactions).toBe(null) // outros não devem mudar
    })

    it('should clear all errors', () => {
      const stateWithErrors: AppState = {
        ...initialState,
        errors: {
          ...initialState.errors,
          auth: 'Auth error',
          transactions: 'Transaction error',
        },
      }

      const action = actionCreators.clearErrors()
      const newState = appReducer(stateWithErrors, action)

      expect(newState.errors.auth).toBe(null)
      expect(newState.errors.transactions).toBe(null)
    })
  })

  describe('UI Actions', () => {
    it('should set theme', () => {
      const action = actionCreators.setTheme('dark')
      const newState = appReducer(initialState, action)

      expect(newState.theme).toBe('dark')
    })

    it('should toggle sidebar', () => {
      expect(initialState.sidebarOpen).toBe(false)

      const action = actionCreators.toggleSidebar()
      const newState = appReducer(initialState, action)

      expect(newState.sidebarOpen).toBe(true)

      const secondToggle = appReducer(newState, action)
      expect(secondToggle.sidebarOpen).toBe(false)
    })

    it('should set sidebar state', () => {
      const action = actionCreators.setSidebar(true)
      const newState = appReducer(initialState, action)

      expect(newState.sidebarOpen).toBe(true)
    })
  })
})
