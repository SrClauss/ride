'use client'

import React, { useState } from 'react'
import { Box } from '@mui/material'
import MainLayout from '@/components/layout/MainLayout'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionModal, { TransactionFormData } from '@/components/transactions/TransactionModal'

export default function TransactionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddTransaction = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
  }

  const handleSubmitTransaction = (transaction: TransactionFormData) => {
    // TODO: Integrar com API
    console.log('Nova transação:', transaction)
    // Aqui seria feita a chamada para a API
  }

  return (
    <MainLayout>
      <Box sx={{ 
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default'
      }}>
        <TransactionList onAddTransaction={handleAddTransaction} />
        
        <TransactionModal 
          open={isAddModalOpen} 
          onClose={handleCloseModal}
          onSubmit={handleSubmitTransaction}
        />
      </Box>
    </MainLayout>
  )
}
