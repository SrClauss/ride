'use client'

import React, { useState } from 'react'
import { 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { 
  TrendingUp,
  TrendingDown,
  AttachMoney,
  LocalGasStation,
  DirectionsCar,
  Analytics
} from '@mui/icons-material'
import SummaryCards from './SummaryCards'
import RevenueChart from './RevenueChart'
import ExpenseChart from './ExpenseChart'
import CategoryChart from './CategoryChart'
import PlatformChart from './PlatformChart'
import TrendChart from './TrendChart'
import PerformanceMetrics from './PerformanceMetrics'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Box>
      {/* Period Selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Dashboard de Análise
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={period}
            label="Período"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="week">Esta Semana</MenuItem>
            <MenuItem value="month">Este Mês</MenuItem>
            <MenuItem value="quarter">Trimestre</MenuItem>
            <MenuItem value="year">Este Ano</MenuItem>
            <MenuItem value="custom">Personalizado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <SummaryCards period={period} />

      {/* Tabs for Different Report Sections */}
      <Card sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab label="Receitas" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Despesas" icon={<TrendingDown />} iconPosition="start" />
            <Tab label="Categorias" icon={<Analytics />} iconPosition="start" />
            <Tab label="Plataformas" icon={<DirectionsCar />} iconPosition="start" />
            <Tab label="Tendências" icon={<AttachMoney />} iconPosition="start" />
            <Tab label="Performance" icon={<LocalGasStation />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Revenue Tab */}
        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Análise de Receitas
            </Typography>
            <RevenueChart period={period} />
          </CardContent>
        </TabPanel>

        {/* Expenses Tab */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Análise de Despesas
            </Typography>
            <ExpenseChart period={period} />
          </CardContent>
        </TabPanel>

        {/* Categories Tab */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribuição por Categorias
            </Typography>
            <CategoryChart period={period} />
          </CardContent>
        </TabPanel>

        {/* Platforms Tab */}
        <TabPanel value={activeTab} index={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance por Plataforma
            </Typography>
            <PlatformChart period={period} />
          </CardContent>
        </TabPanel>

        {/* Trends Tab */}
        <TabPanel value={activeTab} index={4}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tendências Temporais
            </Typography>
            <TrendChart period={period} />
          </CardContent>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={activeTab} index={5}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Métricas de Performance
            </Typography>
            <PerformanceMetrics period={period} />
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  )
}
