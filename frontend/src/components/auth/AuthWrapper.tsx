'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken')
    const authenticated = !!token
    
    console.log('🔥 CheckAuth - Token existe:', authenticated, 'Path:', pathname)
    
    setIsAuthenticated(authenticated)
    
    if (!authenticated && pathname !== '/auth') {
      // Se não há token e não está na página de login, redirecionar
      console.log('🔥 Não autenticado - redirecionando para /auth')
      router.push('/auth')
    } else if (authenticated && pathname === '/auth') {
      // Se há token e está na página de login, redirecionar para home
      console.log('🔥 Autenticado na página de login - redirecionando para /')
      router.push('/')
    }
    
    setIsLoading(false)
  }, [pathname, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Escutar mudanças no localStorage (especialmente para logout)
    const handleStorageChange = () => {
      checkAuth()
    }

    // Listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // Também escutar eventos customizados para logout
    const handleLogout = () => {
      console.log('🔥 AuthWrapper detectou evento de logout')
      setTimeout(checkAuth, 100) // Pequeno delay para garantir que o localStorage foi limpo
    }
    
    window.addEventListener('logout', handleLogout)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logout', handleLogout)
    }
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se está na página de login, mostrar apenas o conteúdo
  if (pathname === '/auth') {
    return <>{children}</>
  }

  // Se não está autenticado e não está na página de login, não mostrar nada
  // (o redirect já foi feito)
  if (!isAuthenticated) {
    return null
  }

  // Se está autenticado, mostrar o conteúdo
  return <>{children}</>
}
