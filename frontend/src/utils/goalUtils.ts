export interface Goal {
  id: string
  title: string
  description?: string
  targetValue: number
  currentValue: number
  deadline: string
  category: string
  status: 'active' | 'completed' | 'paused'
  createdAt: string
  updatedAt: string
}

export type GoalStatus = 'active' | 'completed' | 'paused'

export type GoalCategory = 'emergency' | 'investment' | 'purchase' | 'travel' | 'education' | 'health' | 'other'

export type FilterType = 'all' | GoalStatus
export type CategoryType = 'all' | GoalCategory  
export type SortType = 'created' | 'deadline' | 'progress' | 'value' | 'title'

export const goalCategories: { value: GoalCategory; label: string }[] = [
  { value: 'emergency', label: 'Reserva de Emergência' },
  { value: 'investment', label: 'Investimento' },
  { value: 'purchase', label: 'Compra' },
  { value: 'travel', label: 'Viagem' },
  { value: 'education', label: 'Educação' },
  { value: 'health', label: 'Saúde' },
  { value: 'other', label: 'Outros' }
]

export const goalStatuses: { value: GoalStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Ativa', color: 'primary' },
  { value: 'completed', label: 'Concluída', color: 'success' },
  { value: 'paused', label: 'Pausada', color: 'warning' }
]

export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0
  return Math.min((current / target) * 100, 100)
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const calculateGoalStatistics = (goals: Goal[]) => {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const stats = {
    total: goals.length,
    active: 0,
    completed: 0,
    paused: 0,
    expired: 0,
    nearDeadline: 0,
    totalValue: 0,
    achievedValue: 0,
    completionRate: 0,
    averageProgress: 0
  }

  if (goals.length === 0) return stats

  let totalProgress = 0
  let activeGoalsCount = 0

  goals.forEach(goal => {
    const deadline = new Date(goal.deadline)
    const progress = calculateProgress(goal.currentValue, goal.targetValue)

    // Contagem por status
    switch (goal.status) {
      case 'active':
        stats.active++
        activeGoalsCount++
        totalProgress += progress
        break
      case 'completed':
        stats.completed++
        break
      case 'paused':
        stats.paused++
        break
    }

    // Verifica se está expirada (ativa mas passou do prazo)
    if (goal.status === 'active' && deadline < now) {
      stats.expired++
      stats.active--
    }

    // Verifica se está próxima do prazo
    if (goal.status === 'active' && deadline <= thirtyDaysFromNow && deadline >= now) {
      stats.nearDeadline++
    }

    // Soma valores
    stats.totalValue += goal.targetValue
    stats.achievedValue += goal.currentValue
  })

  // Calcula percentuais
  stats.completionRate = (stats.completed / stats.total) * 100
  stats.averageProgress = activeGoalsCount > 0 ? totalProgress / activeGoalsCount : 0

  return stats
}

export const filterGoals = (goals: Goal[], filters: {
  status?: GoalStatus[]
  category?: string[]
  searchTerm?: string
}): Goal[] => {
  return goals.filter(goal => {
    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(goal.status)) return false
    }

    // Filtro por categoria
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(goal.category)) return false
    }

    // Filtro por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const titleMatch = goal.title.toLowerCase().includes(searchLower)
      const descriptionMatch = goal.description?.toLowerCase().includes(searchLower) || false
      if (!titleMatch && !descriptionMatch) return false
    }

    return true
  })
}

export const sortGoals = (goals: Goal[], sortBy: string): Goal[] => {
  const sortedGoals = [...goals]

  switch (sortBy) {
    case 'deadline':
      return sortedGoals.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    case 'progress':
      return sortedGoals.sort((a, b) => {
        const progressA = calculateProgress(a.currentValue, a.targetValue)
        const progressB = calculateProgress(b.currentValue, b.targetValue)
        return progressB - progressA
      })
    case 'value':
      return sortedGoals.sort((a, b) => b.targetValue - a.targetValue)
    case 'title':
      return sortedGoals.sort((a, b) => a.title.localeCompare(b.title))
    case 'created':
    default:
      return sortedGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export const isGoalExpired = (goal: Goal): boolean => {
  if (goal.status !== 'active') return false
  return new Date(goal.deadline) < new Date()
}

export const getDaysUntilDeadline = (goal: Goal): number => {
  const now = new Date()
  const deadline = new Date(goal.deadline)
  const diffTime = deadline.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'success'
  if (progress >= 75) return 'info'
  if (progress >= 50) return 'primary'
  if (progress >= 25) return 'warning'
  return 'error'
}

export const createEmptyGoal = (): Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: '',
  description: '',
  targetValue: 0,
  currentValue: 0,
  deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano a partir de hoje
  category: 'other',
  status: 'active'
})
