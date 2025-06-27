
'use client'

import { createContext, useContext, type ReactNode, useCallback, useState, useEffect } from 'react'
import type { Transaction, InventoryItem, MenuItem, PayrollEntry, Customization } from '@/types'
import { db, isDbInitialized } from './firebase'
import { ref, onValue, push, set, remove, update, child, get } from 'firebase/database'
import { useToast } from '@/hooks/use-toast'

interface DataContextType {
  transactions: Transaction[]
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>
  inventory: InventoryItem[]
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'transactionId'>) => Promise<void>
  updateInventoryItem: (id: string, data: Omit<InventoryItem, 'id' | 'transactionId'>) => Promise<void>
  deleteInventoryItem: (item: InventoryItem) => Promise<void>
  menuItems: MenuItem[]
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>
  updateMenuItem: (id: string, data: Omit<MenuItem, 'id'>) => Promise<void>
  deleteMenuItem: (id: string) => Promise<void>
  payroll: PayrollEntry[]
  addPayrollEntry: (entry: Omit<PayrollEntry, 'id' | 'netPay' | 'transactionId'>) => Promise<void>
  updatePayrollEntry: (id: string, data: Omit<PayrollEntry, 'id' | 'netPay'>) => Promise<void>
  deletePayrollEntry: (entry: PayrollEntry) => Promise<void>
  customizations: Customization[]
  resetAllData: () => Promise<void>
  isDataReady: boolean
  isDbConnected: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const defaultMenuItems: Omit<MenuItem, 'id'>[] = [
  // Savory Pizzas
  { name: 'Cheese (Mozzarella)', price: 26.99, cost: 8.10, category: 'pizza' },
  { name: 'Pepperoni', price: 29.99, cost: 9.00, category: 'pizza' },
  { name: 'Ham & Corn', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: 'Bacon & Corn', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: 'Calabresa (Brazilian Sausage)', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: 'Frango com Catupiry (Shredded Chicken with Brazilian Cream Cheese)', price: 33.99, cost: 10.20, category: 'pizza' },
  { name: 'Portuguesa (Ham, egg, onion, green olives)', price: 35.99, cost: 10.80, category: 'pizza' },
  { name: 'Canadian Bacon with Pineapple', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: 'Canadian Bacon with Fig', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: 'Caipira (Shredded chicken with corn and green olives)', price: 33.99, cost: 10.20, category: 'pizza' },
  { name: 'Vegetarian (Green pepper, onion, tomato, green olives and corn)', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: '4 Cheese (Mozzarella, Provolone, Parmesan and Cream Cheese)', price: 33.99, cost: 10.20, category: 'pizza' },
  { name: 'Carne Seca com Catupiry (Jerk beef with Brazilian Cream Cheese)', price: 37.99, cost: 11.40, category: 'pizza' },
  { name: 'Shrimp with Catupiry (Brazilian Cream Cheese)', price: 37.99, cost: 11.40, category: 'pizza' },
  { name: 'Aliche (Anchovies)', price: 33.99, cost: 10.20, category: 'pizza' },
  { name: 'Brocolis with bacon', price: 33.99, cost: 10.20, category: 'pizza' },
  // Sweet Pizzas
  { name: 'Brigadeiro (Brazilian Chocolate Truffle)', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: 'Prestígio (Chocolate and Coconut)', price: 31.99, cost: 9.60, category: 'pizza' },
  { name: 'Romeu & Julieta (Guava Paste and Mozzarella Cheese)', price: 31.99, cost: 9.60, category: 'pizza' },
  // Beverages
  { name: 'Soda (Can)', price: 3.00, cost: 1.00, category: 'beverage' },
  { name: 'Guaraná Antárctica (Can)', price: 3.50, cost: 1.25, category: 'beverage' },
  { name: 'Water Bottle', price: 2.50, cost: 0.75, category: 'beverage' },
];

const defaultCustomizations: Omit<Customization, 'id'>[] = [
  { name: 'Borda de Catupiry', price: 5.99, cost: 1.50 },
  { name: 'Borda de Nutella', price: 6.99, cost: 2.00 },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  
  const [loadingStates, setLoadingStates] = useState({
    transactions: true,
    inventory: true,
    menuItems: true,
    payroll: true,
    customizations: true,
  });

  const isDataReady = !Object.values(loadingStates).some(Boolean);

  const seedDatabase = useCallback(async () => {
    if (!db) return;
    try {
      const updates: { [key: string]: any } = {};

      const menuItemsSnapshot = await get(ref(db, 'menuItems'));
      if (!menuItemsSnapshot.exists()) {
        console.log('No menu items found. Seeding database...');
        defaultMenuItems.forEach(item => {
          const newKey = push(child(ref(db), 'menuItems')).key;
          if (newKey) {
            updates[`/menuItems/${newKey}`] = item;
          }
        });
      }

      const customizationsSnapshot = await get(ref(db, 'customizations'));
       if (!customizationsSnapshot.exists()) {
        console.log('No customizations found. Seeding database...');
        defaultCustomizations.forEach(item => {
          const newKey = push(child(ref(db), 'customizations')).key;
          if (newKey) {
            updates[`/customizations/${newKey}`] = item;
          }
        });
      }
      
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        toast({
          title: 'Default Data Seeded!',
          description: 'We\'ve added default menu items and customizations.',
        });
      }

    } catch (error) {
      console.error("Database seeding failed:", error);
      toast({
        title: 'Seeding Failed',
        description: error instanceof Error ? error.message : 'Could not add default data.',
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  useEffect(() => {
    if (isDbInitialized) {
      seedDatabase();
    }
  }, [isDbInitialized, seedDatabase]);

  useEffect(() => {
    if (!isDbInitialized) {
      setLoadingStates({
        transactions: false,
        inventory: false,
        menuItems: false,
        payroll: false,
        customizations: false,
      });
      return;
    }

    const dataPaths = ['transactions', 'inventory', 'menuItems', 'payroll', 'customizations'];
    const setters = {
      transactions: setTransactions,
      inventory: setInventory,
      menuItems: setMenuItems,
      payroll: setPayroll,
      customizations: setCustomizations,
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
  }, [isDbInitialized, toast]);


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

    const transactionToDelete = transactions.find(t => t.id === id);

    if (!transactionToDelete) {
      throw new Error('Transaction not found to delete.');
    }
    
    const updates: { [key: string]: null } = {};
    updates[`/transactions/${id}`] = null;

    if (transactionToDelete.saleId) {
      transactions.forEach(t => {
        if (t.saleId === transactionToDelete.saleId) {
          updates[`/transactions/${t.id}`] = null;
        }
      });
    }
    
    if (transactionToDelete.category === 'Inventory Purchase') {
        const linkedInventoryItem = inventory.find(i => i.transactionId === id);
        if (linkedInventoryItem) {
            updates[`/inventory/${linkedInventoryItem.id}`] = null;
        }
    }

    if (transactionToDelete.category === 'Payroll') {
        const linkedPayrollEntry = payroll.find(p => p.transactionId === id);
        if (linkedPayrollEntry) {
            updates[`/payroll/${linkedPayrollEntry.id}`] = null;
        }
    }

    await update(ref(db), updates);
  }, [transactions, inventory, payroll]);

  const updateTransaction = useCallback(async (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    if (!db) throw new Error('Database not connected.');
    await update(ref(db, `transactions/${id}`), data)
  }, []);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'transactionId'>) => {
    if (!db) throw new Error('Database not connected.');
    
    const newInventoryKey = push(child(ref(db), 'inventory')).key;
    const newTransactionKey = push(child(ref(db), 'transactions')).key;
    
    if (!newInventoryKey || !newTransactionKey) {
      throw new Error("Failed to generate unique keys for new items.");
    }

    const inventoryData: Omit<InventoryItem, 'id'> = {
        ...item,
        transactionId: newTransactionKey,
    };

    const transactionData = {
      type: 'expense' as const,
      date: item.purchaseDate,
      amount: item.totalCost,
      description: `Purchase: ${item.quantity} ${item.unit} of ${item.name}`,
      category: 'Inventory Purchase',
    };

    const updates: { [key:string]: any } = {};
    updates[`/inventory/${newInventoryKey}`] = inventoryData;
    updates[`/transactions/${newTransactionKey}`] = transactionData;

    await update(ref(db), updates)
  }, []);
  
  const updateInventoryItem = useCallback(async (id: string, data: Omit<InventoryItem, 'id' | 'transactionId'>) => {
    if (!db) throw new Error("Database not connected.");
    
    const itemToUpdate = inventory.find(i => i.id === id);
    if (!itemToUpdate) throw new Error("Inventory item not found");

    const inventoryData: Omit<InventoryItem, 'id'> = {
        ...data,
        transactionId: itemToUpdate.transactionId,
    };

    const transactionData = {
        type: 'expense' as const,
        date: data.purchaseDate,
        amount: data.totalCost,
        description: `Purchase: ${data.quantity} ${data.unit} of ${data.name}`,
        category: 'Inventory Purchase',
    };

    const updates: { [key: string]: any } = {};
    updates[`/inventory/${id}`] = inventoryData;
    if (itemToUpdate.transactionId) {
        updates[`/transactions/${itemToUpdate.transactionId}`] = transactionData;
    }

    await update(ref(db), updates);
  }, [inventory]);

  const deleteInventoryItem = useCallback(async (item: InventoryItem) => {
    if (!db) throw new Error('Database not connected.');
    const updates: { [key: string]: null } = {};
    updates[`/inventory/${item.id}`] = null;
    if (item.transactionId) {
        updates[`/transactions/${item.transactionId}`] = null;
    }
    await update(ref(db), updates);
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
  
  const addPayrollEntry = useCallback(async (entry: Omit<PayrollEntry, 'id' | 'netPay' | 'transactionId'>) => {
    if (!db) throw new Error('Database not connected.');
    
    const netPay = entry.grossPay - entry.deductions;
    
    const newPayrollKey = push(child(ref(db), 'payroll')).key;
    const newTransactionKey = push(child(ref(db), 'transactions')).key;

    if(!newPayrollKey || !newTransactionKey) {
        throw new Error("Failed to generate unique keys for new items.");
    }

    const newEntry: Omit<PayrollEntry, 'id'> = { ...entry, netPay, transactionId: newTransactionKey };

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

  const updatePayrollEntry = useCallback(async (id: string, data: Omit<PayrollEntry, 'id' | 'netPay'>) => {
    if (!db) throw new Error('Database not connected.');
    
    const netPay = data.grossPay - data.deductions;
    const updatedEntry: Omit<PayrollEntry, 'id'> = { ...data, netPay };

    const transactionData = {
        type: 'expense' as const,
        date: data.payDate,
        amount: data.grossPay,
        description: `Payroll for ${data.employeeName}`,
        category: 'Payroll',
    };
    
    const updates: { [key: string]: any } = {};
    updates[`/payroll/${id}`] = updatedEntry;
    updates[`/transactions/${data.transactionId}`] = transactionData;

    await update(ref(db), updates);
  }, []);

  const deletePayrollEntry = useCallback(async (entry: PayrollEntry) => {
    if (!db) throw new Error('Database not connected.');
    const updates: { [key: string]: null } = {};
    updates[`/payroll/${entry.id}`] = null;
    if (entry.transactionId) {
      updates[`/transactions/${entry.transactionId}`] = null;
    }
    await update(ref(db), updates);
  }, []);

  const resetAllData = useCallback(async () => {
    if (!db) throw new Error('Database not connected.');

    // Prepare default menu items with new keys
    const menuItemsToSeed: { [key: string]: any } = {};
    defaultMenuItems.forEach(item => {
      const newKey = push(child(ref(db), 'menuItems')).key;
      if (newKey) {
        menuItemsToSeed[newKey] = item;
      }
    });

    // Prepare default customizations with new keys
    const customizationsToSeed: { [key: string]: any } = {};
    defaultCustomizations.forEach(item => {
        const newKey = push(child(ref(db), 'customizations')).key;
        if (newKey) {
            customizationsToSeed[newKey] = item;
        }
    });

    // Create the full object to set in the database, clearing old data
    // and adding the seeded data in one atomic operation.
    const freshData = {
      transactions: null,
      inventory: null,
      payroll: null,
      menuItems: menuItemsToSeed,
      customizations: customizationsToSeed,
    };

    // Atomically set the entire database state
    await set(ref(db), freshData);
  }, []);


  const value = {
    transactions,
    addTransactions,
    deleteTransaction,
    updateTransaction,
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    payroll,
    addPayrollEntry,
    updatePayrollEntry,
    deletePayrollEntry,
    customizations,
    resetAllData,
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

    
