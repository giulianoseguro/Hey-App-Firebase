'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { TransactionsTable } from '@/components/transactions/transactions-table'
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

export default function TransactionsPage() {
  const { transactions, isDataReady } = useData()
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
            <Select value={filterType} onValueChange={setFilterType}>
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
