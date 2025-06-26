'use client'

import { createContext, useContext, type ReactNode, useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { Transaction, InventoryItem } from '@/types'

interface DataContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  inventory: InventoryItem[]
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void
  isDataReady: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', [])
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', [])
  const [isDataReady, setIsDataReady] = useState(false)

  useEffect(() => {
    setIsDataReady(true)
  }, [])

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() }
    setTransactions([newTransaction, ...transactions])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() }
    setInventory([newItem, ...inventory])
  }

  const value = {
    transactions,
    addTransaction,
    deleteTransaction,
    inventory,
    addInventoryItem,
    isDataReady,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
