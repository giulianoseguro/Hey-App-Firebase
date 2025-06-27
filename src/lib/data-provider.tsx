'use client'

import { createContext, useContext, type ReactNode, useCallback, useState, useEffect } from 'react'
import type { Transaction, InventoryItem, MenuItem, PayrollEntry } from '@/types'
import { db, isDbInitialized } from './firebase'
import { ref, onValue, push, set, remove, update, child } from 'firebase/database'
import { useToast } from '@/hooks/use-toast'

interface DataContextType {
  transactions: Transaction[]
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


  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot save data. Database not connected.', variant: 'destructive'});
        return;
    }
    const newTransactionRef = push(ref(db, 'transactions'));
    set(newTransactionRef, transaction).catch(error => {
        console.error("Error adding transaction:", error);
        toast({ title: 'Database Error', description: 'Failed to add transaction. See console for details.', variant: 'destructive'});
    });
  }, [toast]);

  const addTransactions = useCallback((transactionsToAdd: Omit<Transaction, 'id'>[]) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot save data. Database not connected.', variant: 'destructive'});
        return;
    }
    const updates: { [key: string]: any } = {};
    transactionsToAdd.forEach(t => {
      const newKey = push(child(ref(db), 'transactions')).key;
      if (newKey) {
        updates[`/transactions/${newKey}`] = t;
      }
    });
    update(ref(db), updates).catch(error => {
        console.error("Error adding transactions:", error);
        toast({ title: 'Database Error', description: 'Failed to add transactions. See console for details.', variant: 'destructive' });
    });
  }, [toast]);

  const deleteTransaction = useCallback((id: string) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot delete data. Database not connected.', variant: 'destructive' });
        return;
    }
    remove(ref(db, `transactions/${id}`)).catch(error => {
        console.error("Error deleting transaction:", error);
        toast({ title: 'Database Error', description: 'Failed to delete transaction. See console for details.', variant: 'destructive' });
    });
  }, [toast]);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot update data. Database not connected.', variant: 'destructive' });
        return;
    }
    update(ref(db, `transactions/${id}`), data).catch(error => {
        console.error("Error updating transaction:", error);
        toast({ title: 'Database Error', description: 'Failed to update transaction. See console for details.', variant: 'destructive' });
    });
  }, [toast]);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot save data. Database not connected.', variant: 'destructive' });
        return;
    }
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

    update(ref(db), updates).catch(error => {
        console.error("Error adding inventory item:", error);
        toast({ title: 'Database Error', description: 'Failed to add inventory item. See console for details.', variant: 'destructive' });
    });
  }, [toast]);
  
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot save data. Database not connected.', variant: 'destructive' });
        return;
    }
    const newMenuItemRef = push(ref(db, 'menuItems'));
    set(newMenuItemRef, item).catch(error => {
        console.error("Error adding menu item:", error);
        toast({ title: 'Database Error', description: 'Failed to add menu item. See console for details.', variant: 'destructive' });
    });
  }, [toast]);

  const updateMenuItem = useCallback((id: string, data: Omit<MenuItem, 'id'>) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot update data. Database not connected.', variant: 'destructive' });
        return;
    }
    set(ref(db, `menuItems/${id}`), data).catch(error => {
        console.error("Error updating menu item:", error);
        toast({ title: 'Database Error', description: 'Failed to update menu item. See console for details.', variant: 'destructive' });
    });
  }, [toast]);

  const deleteMenuItem = useCallback((id: string) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot delete data. Database not connected.', variant: 'destructive' });
        return;
    }
    remove(ref(db, `menuItems/${id}`)).catch(error => {
        console.error("Error deleting menu item:", error);
        toast({ title: 'Database Error', description: 'Failed to delete menu item. See console for details.', variant: 'destructive' });
    });
  }, [toast]);
  
  const addPayrollEntry = useCallback((entry: Omit<PayrollEntry, 'id' | 'netPay'>) => {
    if (!db) {
        toast({ title: 'Database Error', description: 'Cannot save data. Database not connected.', variant: 'destructive' });
        return;
    }
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

    update(ref(db), updates).catch(error => {
        console.error("Error adding payroll entry:", error);
        toast({ title: 'Database Error', description: 'Failed to add payroll entry. See console for details.', variant: 'destructive' });
    });
  }, [toast]);

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
