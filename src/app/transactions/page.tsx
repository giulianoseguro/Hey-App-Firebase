
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
import { useState, useMemo } from 'react'
import { parseISO } from 'date-fns'
import type { Transaction } from '@/types'

export default function TransactionsPage() {
  const { transactions, isDataReady } = useData()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filterType = searchParams.get('type') || 'all'

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction
    direction: 'ascending' | 'descending'
  }>({ key: 'date', direction: 'descending' })

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('type')
    } else {
      params.set('type', value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const requestSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const filteredAndSortedTransactions = useMemo(() => {
    let filteredItems = transactions
      .filter((t) => filterType === 'all' || t.type === filterType)
      .filter((t) =>
        t.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )

    if (sortConfig) {
      filteredItems.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        let comparison = 0
        if (sortConfig.key === 'date') {
          comparison =
            parseISO(aValue as string).getTime() -
            parseISO(bValue as string).getTime()
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }

        return sortConfig.direction === 'ascending' ? comparison : -comparison
      })
    }

    return filteredItems
  }, [transactions, filterType, debouncedSearchQuery, sortConfig])

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
          <TransactionsTable
            data={filteredAndSortedTransactions}
            requestSort={requestSort}
            sortConfig={sortConfig}
          />
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
