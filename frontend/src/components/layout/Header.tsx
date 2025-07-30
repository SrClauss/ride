'use client'

import React from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Brightness4,
  Brightness7,
} from '@mui/icons-material'
import { useApp, useTheme as useAppTheme } from '../../store/context'

export default function Header() {
  const { state, dispatch, actions } = useApp()
  const { sidebarOpen, user } = state
  const { theme, toggleTheme } = useAppTheme()
  const muiTheme = useTheme()
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    dispatch(actions.toggleSidebar())
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(actions.logout())
    handleMenuClose()
  }

  const isMenuOpen = Boolean(anchorEl)

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 5,
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Dashboard
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{ color: 'text.secondary' }}
            >
              {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Notifications */}
            <IconButton
              color="inherit"
              sx={{ color: 'text.secondary' }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
              {user?.isPaid && (
                <Chip
                  label="Premium"
                  size="small"
                  sx={{
                    backgroundColor: 'success.main',
                    color: 'success.contrastText',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              )}
              
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ p: 0 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight={600}>
            {user?.fullName || user?.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleMenuClose}>
          <Avatar />
          Meu Perfil
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <Avatar />
          Configurações
        </MenuItem>
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Avatar />
          Sair
        </MenuItem>
      </Menu>
    </>
  )
}
