'use client'
import { PageHeader } from '@/components/page-header'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { useData } from '@/lib/data-provider'

export default function InventoryPage() {
  const { inventory } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Estoque"
        description="Acompanhe os níveis de seu estoque e as datas de validade."
      />
      <InventoryTable data={inventory} />
    </div>
  )
}
