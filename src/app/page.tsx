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
      <PageHeader title="Painel" description="Uma visão geral das finanças da sua pizzaria." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Receita Total" value={`R$${totalRevenue.toFixed(2)}`} icon={TrendingUp} />
        <KPICard title="Despesas Totais" value={`R$${totalExpenses.toFixed(2)}`} icon={TrendingDown} />
        <KPICard title="Lucro Líquido" value={`R$${netProfit.toFixed(2)}`} icon={DollarSign} />
        <KPICard title="Itens no Estoque" value={inventoryValue.toString()} icon={Package} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={transactions} />
        <ExpensesChart data={transactions} />
      </div>
    </div>
  );
}
