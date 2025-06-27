
'use client';
import { KPICard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { useData } from '@/lib/data-provider';
import { DollarSign, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GeminiChat } from '@/components/dashboard/gemini-chat';

export default function DashboardPage() {
  const { transactions, inventory, isDataReady } = useData();

  if (!isDataReady) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" description="An overview of your pizzeria's finances." />
        <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gemini Skeleton */}
          <div className="order-1 lg:order-3">
            <Card>
              <CardHeader>
                <CardTitle>Ask Gemini</CardTitle>
                <CardDescription>Ask questions about your business data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px]" />
              </CardContent>
            </Card>
          </div>

          {/* KPIs Skeleton */}
          <div className="order-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-1 lg:col-span-2 lg:grid-cols-4">
            <Skeleton className="h-[108px] w-full" />
            <Skeleton className="h-[108px] w-full" />
            <Skeleton className="h-[108px] w-full" />
            <Skeleton className="h-[108px] w-full" />
          </div>

          {/* Revenue Chart Skeleton */}
          <div className="order-3 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs. Expenses</CardTitle>
                <CardDescription>A monthly overview of your revenue and expenses.</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px]" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gemini Chat: order-1 on mobile, part of 2-col grid on desktop */}
        <div className="order-1 lg:order-3">
          <GeminiChat />
        </div>

        {/* KPIs: order-2 on mobile, full-width row on top on desktop */}
        <div className="order-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-1 lg:col-span-2 lg:grid-cols-4">
          <KPICard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={TrendingUp} href="/transactions?type=revenue" />
          <KPICard title="Total Expenses" value={`$${totalExpenses.toFixed(2)}`} icon={TrendingDown} href="/transactions?type=expense" />
          <KPICard title="Net Profit" value={`$${netProfit.toFixed(2)}`} icon={DollarSign} href="/pnl" />
          <KPICard title="Items in Stock" value={inventoryValue.toString()} icon={Package} href="/inventory" />
        </div>

        {/* Revenue Chart: order-3 on mobile, part of 2-col grid on desktop */}
        <div className="order-3 lg:order-2">
          <RevenueChart data={transactions} />
        </div>
      </div>
    </div>
  );
}
