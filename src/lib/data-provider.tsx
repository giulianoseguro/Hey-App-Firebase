'use client'

import { createContext, useContext, type ReactNode, useCallback, useState, useEffect } from 'react'
import type { Transaction, InventoryItem, MenuItem } from '@/types'

// A helper function to get data from local storage safely.
function getInitialState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
}


interface DataContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, data: Omit<Transaction, 'id'>) => void
  inventory: InventoryItem[]
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void
  menuItems: MenuItem[]
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void
  updateMenuItem: (id: string, data: Omit<MenuItem, 'id'>) => void
  deleteMenuItem: (id: string) => void
  isDataReady: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState('transactions', []));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getInitialState('inventory', []));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getInitialState('menuItems', []));
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setTransactions(getInitialState('transactions', []));
        setInventory(getInitialState('inventory', []));
        setMenuItems(getInitialState('menuItems', []));
      } finally {
        setIsDataReady(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isDataReady) {
      window.localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions, isDataReady]);

  useEffect(() => {
    if (isDataReady) {
      window.localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  }, [inventory, isDataReady]);

  useEffect(() => {
    if (isDataReady) {
      window.localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
  }, [menuItems, isDataReady]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() }
    setTransactions((prev) => [newTransaction, ...prev])
  }, []);

  const addTransactions = useCallback((transactions: Omit<Transaction, 'id'>[]) => {
    const newTransactions = transactions.map(t => ({...t, id: crypto.randomUUID()}));
    setTransactions(prev => [...newTransactions, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, []);

  const updateTransaction = useCallback((id: string, data: Omit<Transaction, 'id'>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { id, ...data } : t))
    )
  }, []);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() }
    setInventory((prev) => [newItem, ...prev])
    addTransaction({
      type: 'expense',
      date: item.purchaseDate,
      amount: item.totalCost,
      description: `Purchase: ${item.quantity} ${item.unit} of ${item.name}`,
      category: 'Inventory Purchase',
    })
  }, [addTransaction]);
  
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setMenuItems(prev => [newItem, ...prev]);
  }, []);

  const updateMenuItem = useCallback((id: string, data: Omit<MenuItem, 'id'>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { id, ...data } : item));
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  }, []);


  const value = {
    transactions,
    addTransaction,
    addTransactions,
    deleteTransaction,
    updateTransaction,
    inventory,
    addInventoryItem,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
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
