'use client'

import React, { useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { useTheme } from '../../store/context'
import { darkTheme, lightTheme } from '../../theme/uber-theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useTheme()
  
  const muiTheme = useMemo(() => {
    return theme === 'dark' ? darkTheme : lightTheme
  }, [theme])

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
