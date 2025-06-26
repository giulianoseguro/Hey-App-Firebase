'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { InventoryItem } from '@/types'
import { format, differenceInDays, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface InventoryTableProps {
  data: InventoryItem[]
}

const LOW_STOCK_THRESHOLD = 10;
const EXPIRY_SOON_THRESHOLD_DAYS = 7;

export function InventoryTable({ data }: InventoryTableProps) {
    
  const getStatus = (item: InventoryItem) => {
    const daysToExpiry = differenceInDays(parseISO(item.expiryDate), new Date())
    const isLowStock = item.quantity < LOW_STOCK_THRESHOLD

    if (daysToExpiry < 0) return { text: 'Expired', variant: 'destructive' } as const
    if (daysToExpiry <= EXPIRY_SOON_THRESHOLD_DAYS) return { text: `Expires in ${daysToExpiry}d`, variant: 'destructive' } as const
    if (isLowStock) return { text: 'Low Stock', variant: 'secondary' } as const
    
    return null
  }

  const sortedData = [...data].sort((a, b) => differenceInDays(parseISO(a.expiryDate), new Date()) - differenceInDays(parseISO(b.expiryDate), new Date()));

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((item) => {
              const status = getStatus(item)
              const rowClass = status?.variant === 'destructive' ? 'bg-destructive/10' : ''
              return (
                <TableRow key={item.id} className={rowClass}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{`${item.quantity} ${item.unit}`}</TableCell>
                  <TableCell>{format(parseISO(item.purchaseDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(parseISO(item.expiryDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {status && <Badge variant={status.variant}>{status.text}</Badge>}
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No inventory items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
