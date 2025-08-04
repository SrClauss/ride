import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { ApiResponse, ErrorData, RequestParams } from '../types'

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

console.log('🔧 API Configuration:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
})

// Criar instância do Axios
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Tratar erro 401 - Token expirado
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        // Redirecionar para login se necessário
        window.location.href = '/auth/login'
      }
    }
    
    // Tratar outros erros
    const errorMessage = getErrorMessage(error)
    console.error('API Error:', errorMessage)
    
    return Promise.reject(error)
  }
)

// Função para extrair mensagem de erro
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as ErrorData
    if (data.message) return data.message
    if (data.detail) return data.detail
    if (data.errors) {
      // Tratar erros de validação do FastAPI
      const errors = Object.values(data.errors).flat()
      return errors.join(', ')
    }
  }
  
  if (error.message) return error.message
  return 'Erro desconhecido'
}

// Funções helper para requisições
export const apiClient = {
  // GET
  get: async <T>(url: string, params?: RequestParams): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get(url, { params })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error as AxiosError),
      }
    }
  },

  // POST
  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post(url, data)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      return {
        success: false,
        message: getErrorMessage(axiosError),
        errors: (axiosError.response?.data as ErrorData)?.errors,
      }
    }
  },

  // PUT
  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put(url, data)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      return {
        success: false,
        message: getErrorMessage(axiosError),
        errors: (axiosError.response?.data as ErrorData)?.errors,
      }
    }
  },

  // DELETE
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete(url)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error as AxiosError),
      }
    }
  },

  // PATCH
  patch: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await api.patch(url, data)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      return {
        success: false,
        message: getErrorMessage(axiosError),
        errors: (axiosError.response?.data as ErrorData)?.errors,
      }
    }
  },
}

// Função para upload de arquivos
export const uploadFile = async (file: File, url: string): Promise<ApiResponse<{ url: string }>> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error as AxiosError),
    }
  }
}

// Função para verificar se a API está online
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health')
    return response.status === 200
  } catch {
    return false
  }
}

export default api
