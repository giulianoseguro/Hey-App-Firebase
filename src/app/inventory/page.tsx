'use client'
import { PageHeader } from '@/components/page-header'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { useData } from '@/lib/data-provider'
import { Skeleton } from '@/components/ui/skeleton'

export default function InventoryPage() {
  const { inventory, isDataReady } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        description="Keep track of your stock levels and expiry dates."
      />
      {isDataReady ? (
        <InventoryTable data={inventory} />
      ) : (
        <div className="rounded-lg border">
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}
    </div>
  )
}
