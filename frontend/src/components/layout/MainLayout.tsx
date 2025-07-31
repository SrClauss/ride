'use client'

import React from 'react'
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import { useApp } from '../../store/context'
import Header from './Header'
import Sidebar from './Sidebar'
import AuthGuard from '../auth/AuthGuard'

interface MainLayoutProps {
  children: React.ReactNode
}

const drawerWidth = 280
const mobileDrawerWidth = 72

export default function MainLayout({ children }: MainLayoutProps) {
  const { state } = useApp()
  const { sidebarOpen } = state
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        
        {/* Header */}
        <Header />
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            minHeight: '100vh',
            width: isMobile ? '100%' : 'auto',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: isMobile 
              ? 0 
              : sidebarOpen 
                ? `${drawerWidth}px`
                : `${mobileDrawerWidth}px`,
            // Garantir que o conteúdo não seja sobreposto
            [theme.breakpoints.down('md')]: {
              marginLeft: 0,
              width: '100%',
            },
            [theme.breakpoints.up('md')]: {
              marginLeft: sidebarOpen ? `${drawerWidth}px` : `${mobileDrawerWidth}px`,
            },
          }}
        >
          <Toolbar />
          <Box sx={{ 
            p: isMobile ? 1 : 3,
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            {children}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  )
}
