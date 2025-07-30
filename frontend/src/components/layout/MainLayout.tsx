'use client'

import React from 'react'
import { Box, CssBaseline, Toolbar } from '@mui/material'
import { useApp } from '../../store/context'
import Header from './Header'
import Sidebar from './Sidebar'
import AuthGuard from '../auth/AuthGuard'

interface MainLayoutProps {
  children: React.ReactNode
}

const drawerWidth = 280

export default function MainLayout({ children }: MainLayoutProps) {
  const { state } = useApp()
  const { sidebarOpen } = state

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex' }}>
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
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: sidebarOpen ? 0 : `-${drawerWidth - 72}px`,
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </AuthGuard>
  )
}
