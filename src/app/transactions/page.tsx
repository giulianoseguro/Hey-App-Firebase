
'use client'

import { useData } from '@/lib/data-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/use-debounce'
import { PageHeader } from '@/components/page-header'
import { TransactionsTable } from '@/components/transactions/transactions-table'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { parseISO } from 'date-fns'

export default function TransactionsPage() {
  const { transactions, isDataReady } = useData()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filterType = searchParams.get('type') || 'all'

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('type')
    } else {
      params.set('type', value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const sortedTransactions = [...transactions].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  )

  const filteredTransactions = sortedTransactions
    .filter((t) => filterType === 'all' || t.type === filterType)
    .filter((t) =>
      t.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Transactions"
        description="View, edit, and manage all your transactions."
      />
      {isDataReady ? (
        <>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TransactionsTable data={filteredTransactions} />
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-sm max-w-sm" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <div className="rounded-lg border">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      )}
    </div>
  )
}
