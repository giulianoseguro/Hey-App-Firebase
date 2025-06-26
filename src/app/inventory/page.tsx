'use client'
import { PageHeader } from '@/components/page-header'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { useData } from '@/lib/data-provider'

export default function InventoryPage() {
  const { inventory } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        description="Keep track of your stock levels and expiry dates."
      />
      <InventoryTable data={inventory} />
    </div>
  )
}
