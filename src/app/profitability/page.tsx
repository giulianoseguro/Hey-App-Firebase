'use client'
import { PageHeader } from '@/components/page-header'
import { ProfitabilityTable } from '@/components/profitability/profitability-table'
import { useData } from '@/lib/data-provider'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfitabilityPage() {
  const { menuItems, transactions, isDataReady } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profitability"
        description="Analyze the performance and profit of each menu item."
      />
      {isDataReady ? (
        <ProfitabilityTable menuItems={menuItems} transactions={transactions} />
      ) : (
        <div className="rounded-lg border">
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}
    </div>
  )
}
