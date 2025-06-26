'use client'
import { PageHeader } from '@/components/page-header'
import { PnlTable } from '@/components/pnl/pnl-table'
import { useData } from '@/lib/data-provider'
import { ExportButton } from '@/components/pnl/export-button'

export default function PnlPage() {
  const { transactions } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profit & Loss"
        description="Review your income and expenses."
      >
        <ExportButton data={transactions} />
      </PageHeader>
      <PnlTable data={transactions} />
    </div>
  )
}
