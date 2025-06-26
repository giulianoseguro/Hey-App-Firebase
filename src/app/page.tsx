'use client';
import { KPICard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ExpensesChart } from '@/components/dashboard/expenses-chart';
import { useData } from '@/lib/data-provider';
import { DollarSign, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export default function DashboardPage() {
  const { transactions, inventory } = useData();

  const totalRevenue = transactions
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  
  const inventoryValue = inventory.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="An overview of your pizzeria's finances." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={TrendingUp} />
        <KPICard title="Total Expenses" value={`$${totalExpenses.toFixed(2)}`} icon={TrendingDown} />
        <KPICard title="Net Profit" value={`$${netProfit.toFixed(2)}`} icon={DollarSign} />
        <KPICard title="Items in Stock" value={inventoryValue.toString()} icon={Package} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={transactions} />
        <ExpensesChart data={transactions} />
      </div>
    </div>
  );
}
