export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  date: string; // ISO string
  amount: number;
  description: string;
  category: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  purchaseDate: string; // ISO string
  expiryDate: string; // ISO string
  totalCost: number;
}
