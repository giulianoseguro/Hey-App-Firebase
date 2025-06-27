'use client'

import { createContext, useContext, type ReactNode, useCallback, useState, useEffect } from 'react'
import type { Transaction, InventoryItem, MenuItem, PayrollEntry } from '@/types'
import { db } from './firebase'
import { ref, onValue, push, set, remove, update, child } from 'firebase/database'


interface DataContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => void
  inventory: InventoryItem[]
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void
  menuItems: MenuItem[]
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void
  updateMenuItem: (id: string, data: Omit<MenuItem, 'id'>) => void
  deleteMenuItem: (id: string) => void
  payroll: PayrollEntry[]
  addPayrollEntry: (entry: Omit<PayrollEntry, 'id' | 'netPay'>) => void
  isDataReady: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  
  const [loadingStates, setLoadingStates] = useState({
    transactions: true,
    inventory: true,
    menuItems: true,
    payroll: true,
  });

  const isDataReady = !Object.values(loadingStates).some(Boolean);

  useEffect(() => {
    if (!db) {
      console.warn("Database not configured. Skipping data fetch.");
      setLoadingStates({
        transactions: false,
        inventory: false,
        menuItems: false,
        payroll: false,
      });
      return;
    }

    const dataPaths = ['transactions', 'inventory', 'menuItems', 'payroll'];
    const setters = {
      transactions: setTransactions,
      inventory: setInventory,
      menuItems: setMenuItems,
      payroll: setPayroll,
    };

    const unsubscribes = dataPaths.map(path => {
      const dbRef = ref(db, `${path}/`);
      return onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        const loadedItems: any[] = [];
        if (data) {
          for (const id in data) {
            loadedItems.push({ id, ...data[id] });
          }
        }
        (setters as any)[path](loadedItems);
        setLoadingStates(prev => ({ ...prev, [path]: false }));
      }, (error) => {
        console.error(`Firebase [${path}] read failed:`, error);
        setLoadingStates(prev => ({ ...prev, [path]: false }));
      });
    });

    // The returned function will be called on component unmount
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, []);


  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    if (!db) return;
    const newTransactionRef = push(ref(db, 'transactions'));
    set(newTransactionRef, transaction);
  }, []);

  const addTransactions = useCallback((transactionsToAdd: Omit<Transaction, 'id'>[]) => {
    if (!db) return;
    const updates: { [key: string]: any } = {};
    transactionsToAdd.forEach(t => {
      const newKey = push(child(ref(db), 'transactions')).key;
      if (newKey) {
        updates[`/transactions/${newKey}`] = t;
      }
    });
    return update(ref(db), updates);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    if (!db) return;
    remove(ref(db, `transactions/${id}`));
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    if (!db) return;
    update(ref(db, `transactions/${id}`), data);
  }, []);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    if (!db) return;
    const newInventoryKey = push(child(ref(db), 'inventory')).key;
    const newTransactionKey = push(child(ref(db), 'transactions')).key;
    
    if (!newInventoryKey || !newTransactionKey) return;

    const transactionData = {
      type: 'expense' as const,
      date: item.purchaseDate,
      amount: item.totalCost,
      description: `Purchase: ${item.quantity} ${item.unit} of ${item.name}`,
      category: 'Inventory Purchase',
    };

    const updates: { [key:string]: any } = {};
    updates[`/inventory/${newInventoryKey}`] = item;
    updates[`/transactions/${newTransactionKey}`] = transactionData;

    return update(ref(db), updates);
  }, []);
  
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    if (!db) return;
    const newMenuItemRef = push(ref(db, 'menuItems'));
    set(newMenuItemRef, item);
  }, []);

  const updateMenuItem = useCallback((id: string, data: Omit<MenuItem, 'id'>) => {
    if (!db) return;
    set(ref(db, `menuItems/${id}`), data);
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    if (!db) return;
    remove(ref(db, `menuItems/${id}`));
  }, []);
  
  const addPayrollEntry = useCallback((entry: Omit<PayrollEntry, 'id' | 'netPay'>) => {
    if (!db) return;
    const netPay = entry.grossPay - entry.deductions;
    const newEntry = { ...entry, netPay };
    
    const newPayrollKey = push(child(ref(db), 'payroll')).key;
    const newTransactionKey = push(child(ref(db), 'transactions')).key;

    if(!newPayrollKey || !newTransactionKey) return;

    const transactionData = {
        type: 'expense' as const,
        date: entry.payDate,
        amount: entry.grossPay,
        description: `Payroll for ${entry.employeeName}`,
        category: 'Payroll',
    };
    
    const updates: { [key: string]: any } = {};
    updates[`/payroll/${newPayrollKey}`] = newEntry;
    updates[`/transactions/${newTransactionKey}`] = transactionData;

    return update(ref(db), updates);
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
    payroll,
    addPayrollEntry,
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
