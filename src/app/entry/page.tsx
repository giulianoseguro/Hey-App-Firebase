'use client'
import { PageHeader } from '@/components/page-header'
import { EntryForm } from '@/components/entry/entry-form'
import { useData } from '@/lib/data-provider'
import { Skeleton } from '@/components/ui/skeleton'

function EntryPageSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-[246px] w-full rounded-lg" />
        <Skeleton className="h-[286px] w-full rounded-lg" />
        <Skeleton className="h-[326px] w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Skeleton className="h-[188px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function EntryPage() {
  const { isDataReady } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Entry"
        description="Add your revenue, expenses, and inventory. The AI assistant will help identify any issues."
      />
      {isDataReady ? <EntryForm /> : <EntryPageSkeleton />}
    </div>
  )
}
