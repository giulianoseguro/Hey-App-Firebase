'use client'

import { createContext, useContext, type ReactNode } from 'react'
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
  const [transactions, setTransactions, isTransactionsReady] = useLocalStorage<Transaction[]>('transactions', [])
  const [inventory, setInventory, isInventoryReady] = useLocalStorage<InventoryItem[]>('inventory', [])

  const isDataReady = isTransactionsReady && isInventoryReady

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() }
    setInventory((prev) => [newItem, ...prev])
    addTransaction({
      type: 'expense',
      date: item.purchaseDate,
      amount: item.totalCost,
      description: `Purchase: ${item.quantity} ${item.unit} of ${item.name}`,
      category: 'Inventory',
    })
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
