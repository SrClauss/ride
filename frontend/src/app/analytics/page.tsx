'use client'

import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import ReportsPage from '../../components/reports/ReportsPage'

export default function AnalyticsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
          Relatórios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análise detalhada das suas finanças como motorista
        </Typography>
      </Box>
      
      <ReportsPage />
    </Container>
  )
}
