
'use client'

import { createContext, useContext, type ReactNode, useCallback, useState, useEffect } from 'react'
import type { Transaction, InventoryItem, MenuItem, PayrollEntry } from '@/types'
import { db, isDbInitialized } from './firebase'
import { ref, onValue, push, set, remove, update, child } from 'firebase/database'
import { useToast } from '@/hooks/use-toast'

interface DataContextType {
  transactions: Transaction[]
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>
  inventory: InventoryItem[]
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>
  menuItems: MenuItem[]
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>
  updateMenuItem: (id: string, data: Omit<MenuItem, 'id'>) => Promise<void>
  deleteMenuItem: (id: string) => Promise<void>
  payroll: PayrollEntry[]
  addPayrollEntry: (entry: Omit<PayrollEntry, 'id' | 'netPay'>) => Promise<void>
  isDataReady: boolean
  isDbConnected: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
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
    if (!isDbInitialized) {
      toast({
        title: 'Database Not Connected',
        description: 'Your Firebase credentials may be missing or incorrect. Data cannot be loaded or saved.',
        variant: 'destructive',
      });
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
      const dbRef = ref(db, path);
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
        toast({
            title: 'Database Read Error',
            description: `Failed to load ${path}. Check console for details.`,
            variant: 'destructive'
        });
        setLoadingStates(prev => ({ ...prev, [path]: false }));
      });
    });

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [toast]);


  const addTransactions = useCallback(async (transactionsToAdd: Omit<Transaction, 'id'>[]) => {
    if (!db) throw new Error('Database not connected.');
    const updates: { [key: string]: any } = {};
    transactionsToAdd.forEach(t => {
      const newKey = push(child(ref(db), 'transactions')).key;
      if (newKey) {
        updates[`/transactions/${newKey}`] = t;
      }
    });
    await update(ref(db), updates)
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!db) throw new Error('Database not connected.');
    await remove(ref(db, `transactions/${id}`))
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    if (!db) throw new Error('Database not connected.');
    await update(ref(db, `transactions/${id}`), data)
  }, []);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    if (!db) throw new Error('Database not connected.');
    
    const newInventoryKey = push(child(ref(db), 'inventory')).key;
    const newTransactionKey = push(child(ref(db), 'transactions')).key;
    
    if (!newInventoryKey || !newTransactionKey) {
      throw new Error("Failed to generate unique keys for new items.");
    }

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

    await update(ref(db), updates)
  }, []);
  
  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    if (!db) throw new Error('Database not connected.');
    const newMenuItemRef = push(ref(db, 'menuItems'));
    await set(newMenuItemRef, item);
  }, []);

  const updateMenuItem = useCallback(async (id: string, data: Omit<MenuItem, 'id'>) => {
    if (!db) throw new Error('Database not connected.');
    await set(ref(db, `menuItems/${id}`), data)
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    if (!db) throw new Error('Database not connected.');
    await remove(ref(db, `menuItems/${id}`))
  }, []);
  
  const addPayrollEntry = useCallback(async (entry: Omit<PayrollEntry, 'id' | 'netPay'>) => {
    if (!db) throw new Error('Database not connected.');
    
    const netPay = entry.grossPay - entry.deductions;
    const newEntry = { ...entry, netPay };
    
    const newPayrollKey = push(child(ref(db), 'payroll')).key;
    const newTransactionKey = push(child(ref(db), 'transactions')).key;

    if(!newPayrollKey || !newTransactionKey) {
        throw new Error("Failed to generate unique keys for new items.");
    }

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

    await update(ref(db), updates);
  }, []);

  const value = {
    transactions,
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
    isDbConnected: isDbInitialized,
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
