'use client'
import { PageHeader } from '@/components/page-header'
import { PayrollForm } from '@/components/payroll/payroll-form'
import { PayrollTable } from '@/components/payroll/payroll-table'
import { useData } from '@/lib/data-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMounted } from '@/hooks/use-is-mounted'

function PayrollPageSkeleton() {
    return (
        <div className="grid animate-pulse gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Skeleton className="h-[408px] w-full" />
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-lg border">
                <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </div>
    )
}

export default function PayrollPage() {
  const { payroll, isDataReady } = useData()
  const isMounted = useIsMounted();

  if (!isMounted || !isDataReady) {
      return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Payroll"
                description="Manage employee payroll and track related expenses."
            />
            <PayrollPageSkeleton />
        </div>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payroll"
        description="Manage employee payroll and track related expenses."
      />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <PayrollForm />
          </div>
          <div className="lg:col-span-2">
            <PayrollTable data={payroll} />
          </div>
        </div>
    </div>
  )
}
