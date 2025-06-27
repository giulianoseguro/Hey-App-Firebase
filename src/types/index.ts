export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  date: string; // ISO string
  amount: number;
  description: string;
  category: string;
  menuItemId?: string; // Link to menu item for sales
  quantity?: number; // Quantity of menu items sold
  saleId?: string; // Links revenue, cogs, and tax transactions together
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  purchaseDate: string; // ISO string
  expiryDate: string; // ISO string
  totalCost: number;
  transactionId: string; // ID of the associated expense transaction
}

export interface MenuItem {
  id:string;
  name: string;
  price: number;
  cost: number;
  category: 'pizza' | 'beverage' | 'other';
}

export interface PayrollEntry {
  id: string;
  employeeName: string;
  payDate: string; // ISO string
  grossPay: number;
  deductions: number;
  netPay: number;
  transactionId: string; // ID of the associated expense transaction
}

export interface Customization {
  id: string;
  name: string;
  price: number;
  cost: number;
}
