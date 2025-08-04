import { useState, useEffect } from 'react'
import { categoryService } from '../services/dataService'
import { Category } from '../types'

export interface CreateCategoryData {
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
  icone?: string
}

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Hook: Fetching categories...')
      
      const result = await categoryService.getCategories()
      setCategories(result)
      
      console.log('✅ Hook: Categories loaded successfully', result.length, 'items')
    } catch (err) {
      console.error('❌ Hook: Error loading categories:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const createCategory = async (categoryData: CreateCategoryData) => {
    try {
      console.log('🔄 Hook: Creating category...', categoryData)
      const newCategory = await categoryService.createCategory(categoryData)
      setCategories(prev => [...prev, newCategory])
      console.log('✅ Hook: Category created successfully')
      return newCategory
    } catch (err) {
      console.error('❌ Hook: Error creating category:', err)
      throw err
    }
  }

  const refetch = () => {
    fetchData()
  }

  // Filtros úteis
  const receitaCategories = categories.filter(cat => cat.tipo === 'receita')
  const despesaCategories = categories.filter(cat => cat.tipo === 'despesa')

  return { 
    categories,
    receitaCategories,
    despesaCategories,
    loading, 
    error, 
    createCategory,
    refetch 
  }
}

export const useCategoryById = (id: string | number) => {
  const { categories, loading, error } = useCategoriesData()
  
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id
  const category = categories.find(cat => cat.id === numericId)
  
  return { category, loading, error }
}
