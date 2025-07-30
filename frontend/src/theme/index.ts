'use client'

import { createTheme, ThemeOptions } from '@mui/material/styles'
import { purple, blue, grey, green, red, orange } from '@mui/material/colors'

// Cores customizadas baseadas no GPS Financeiro
const customColors = {
  primary: {
    main: purple[600],     // Roxo principal
    light: purple[400],
    dark: purple[800],
    contrastText: '#ffffff',
  },
  secondary: {
    main: blue[600],       // Azul secundário
    light: blue[400],
    dark: blue[800],
    contrastText: '#ffffff',
  },
  success: {
    main: green[600],
    light: green[400],
    dark: green[800],
  },
  error: {
    main: red[600],
    light: red[400],
    dark: red[800],
  },
  warning: {
    main: orange[600],
    light: orange[400],
    dark: orange[800],
  },
  info: {
    main: blue[500],
    light: blue[300],
    dark: blue[700],
  },
}

// Configurações base do tema
const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${customColors.primary.main} 0%, ${customColors.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${customColors.primary.dark} 0%, ${customColors.primary.main} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderBottomColor: 'rgba(0,0,0,0.05)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          borderTop: '1px solid',
          borderTopColor: 'rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
}

// Tema claro
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    ...customColors,
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: grey[900],
      secondary: grey[600],
    },
    divider: grey[200],
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: grey[200],
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: grey[900],
          boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderBottomColor: grey[200],
        },
      },
    },
  },
})

// Tema escuro
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    ...customColors,
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: grey[400],
    },
    divider: grey[800],
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1px solid',
          borderColor: grey[800],
          backgroundColor: '#1a1a1a',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          boxShadow: '0 1px 8px rgba(0,0,0,0.3)',
          borderBottom: '1px solid',
          borderBottomColor: grey[800],
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          borderTop: '1px solid',
          borderTopColor: grey[800],
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
        },
      },
    },
  },
})

// Cores para categorias (similar ao GPS Financeiro)
export const categoryColors = [
  '#9c27b0', // Purple
  '#3f51b5', // Indigo  
  '#2196f3', // Blue
  '#00bcd4', // Cyan
  '#009688', // Teal
  '#4caf50', // Green
  '#8bc34a', // Light Green
  '#cddc39', // Lime
  '#ffeb3b', // Yellow
  '#ffc107', // Amber
  '#ff9800', // Orange
  '#ff5722', // Deep Orange
  '#f44336', // Red
  '#e91e63', // Pink
  '#795548', // Brown
  '#607d8b', // Blue Grey
]

// Função para obter cor da categoria
export const getCategoryColor = (index: number): string => {
  return categoryColors[index % categoryColors.length]
}

// Função para gerar tema baseado na preferência
export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'light' ? lightTheme : darkTheme
}
