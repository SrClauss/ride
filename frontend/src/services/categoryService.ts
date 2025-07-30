import { apiClient } from './api'
import { Category } from '../types'

export interface CategoryForm {
  nome: string
  tipo: 'receita' | 'despesa'
  cor?: string
  icone?: string
  descricao?: string
}

export const categoryService = {
  // Buscar categorias
  getCategories: async (
    tipo?: 'receita' | 'despesa',
    apenas_ativas: boolean = true
  ) => {
    const params = {
      ...(tipo && { tipo }),
      apenas_ativas
    }
    
    return apiClient.get<Category[]>('/categories', params)
  },

  // Criar nova categoria
  createCategory: async (data: CategoryForm) => {
    return apiClient.post<Category>('/categories', data)
  },

  // Atualizar categoria
  updateCategory: async (id: string, data: Partial<CategoryForm>) => {
    return apiClient.put<Category>(`/categories/${id}`, data)
  },

  // Deletar categoria
  deleteCategory: async (id: string) => {
    return apiClient.delete(`/categories/${id}`)
  },

  // Estatísticas de uso das categorias
  getCategoryStats: async (
    data_inicio?: string,
    data_fim?: string
  ) => {
    const params = {
      ...(data_inicio && { data_inicio }),
      ...(data_fim && { data_fim })
    }
    
    return apiClient.get('/categories/stats', params)
  }
}
