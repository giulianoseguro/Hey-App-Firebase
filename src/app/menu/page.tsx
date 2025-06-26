'use client'
import { PageHeader } from '@/components/page-header'
import { MenuTable } from '@/components/menu/menu-table'
import { useData } from '@/lib/data-provider'
import { Skeleton } from '@/components/ui/skeleton'

export default function MenuPage() {
  const { menuItems, isDataReady } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menu Items"
        description="Manage the items you sell, including their prices and costs."
      />
      {isDataReady ? (
        <MenuTable data={menuItems} />
      ) : (
        <div className="rounded-lg border">
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}
    </div>
  )
}
