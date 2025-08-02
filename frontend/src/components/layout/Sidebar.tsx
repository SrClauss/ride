'use client'

import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AccountBalance as TransactionsIcon,
  Analytics as AnalyticsIcon,
  TrackChanges as GoalsIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  Logout,
} from '@mui/icons-material'
import { useApp } from '../../store/context'
import { useRouter, usePathname } from 'next/navigation'

const menuItems = [
  { icon: DashboardIcon, text: 'Dashboard', path: '/' },
  { icon: TransactionsIcon, text: 'Transações', path: '/transactions' },
  { icon: AnalyticsIcon, text: 'Relatórios', path: '/analytics' },
  { icon: GoalsIcon, text: 'Metas', path: '/goals' },
  { icon: ProfileIcon, text: 'Perfil', path: '/profile' },
  { icon: SettingsIcon, text: 'Configurações', path: '/settings' },
]

import { User } from '../../types'

const drawerWidth = 280
const mobileDrawerWidth = 72

// Componente para o conteúdo do sidebar (reutilizado em mobile e desktop)
function SidebarContent({ user, handleLogout, isOpen }: { 
  user: User | null; 
  handleLogout: () => void; 
  isOpen: boolean 
}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <>
      {/* User Info */}
      {isOpen && user && (
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              {user.fullName?.charAt(0) || user.username?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                sx={{ color: 'text.primary' }}
              >
                {user.fullName || user.username}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: 'text.secondary' }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
          {user.isPaid && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                backgroundColor: 'success.main',
                color: 'success.contrastText',
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Premium
            </Box>
          )}
        </Box>
      )}

      <Divider />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: isOpen ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isOpen ? 3 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: isOpen ? 1 : 0,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* Logout */}
      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 48,
            justifyContent: isOpen ? 'initial' : 'center',
            px: 2.5,
            borderRadius: 1,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.dark',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isOpen ? 3 : 'auto',
              justifyContent: 'center',
              color: 'inherit',
            }}
          >
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Sair"
            sx={{
              opacity: isOpen ? 1 : 0,
              '& .MuiListItemText-primary': {
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }}
          />
        </ListItemButton>
      </Box>
    </>
  )
}

export default function Sidebar() {
  const { state, dispatch, actions } = useApp()
  const { sidebarOpen, user } = state
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerClose = () => {
    dispatch(actions.setSidebar(false))
  }

  const handleLogout = () => {
    dispatch(actions.logout())
  }

  // Em mobile, usar drawer temporário
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* Mobile Sidebar Content */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 2,
            minHeight: 64,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              RF
            </Avatar>
            <Typography variant="h6" noWrap component="div" fontWeight={600}>
              Rider Finance
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <Divider />
        
        <SidebarContent user={user} handleLogout={handleLogout} isOpen={true} />
      </Drawer>
    )
  }

  // Desktop: drawer permanente
  return (
    <Drawer
      variant="permanent"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? drawerWidth : mobileDrawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? drawerWidth : mobileDrawerWidth,
          overflowX: 'hidden',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          px: sidebarOpen ? 2 : 1,
          py: 2,
          minHeight: 64,
        }}
      >
        {sidebarOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              RF
            </Avatar>
            <Typography variant="h6" noWrap component="div" fontWeight={600}>
              Rider Finance
            </Typography>
          </Box>
        )}
        {!sidebarOpen && (
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1.2rem',
            }}
          >
            RF
          </Avatar>
        )}
        {sidebarOpen && (
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider />
      
      <SidebarContent user={user} handleLogout={handleLogout} isOpen={sidebarOpen} />
    </Drawer>
  )
}
