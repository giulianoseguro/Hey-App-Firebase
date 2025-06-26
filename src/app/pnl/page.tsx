'use client'
import { PageHeader } from '@/components/page-header'
import { PnlTable } from '@/components/pnl/pnl-table'
import { useData } from '@/lib/data-provider'
import { ExportButton } from '@/components/pnl/export-button'
import { Skeleton } from '@/components/ui/skeleton'

export default function PnlPage() {
  const { transactions, isDataReady } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profit & Loss"
        description="Review your income and expenses."
      >
        <ExportButton data={transactions} disabled={!isDataReady || transactions.length === 0} />
      </PageHeader>
      {isDataReady ? (
        <PnlTable data={transactions} />
      ) : (
        <div className="rounded-lg border">
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}
    </div>
  )
}
