
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table'
import type { Transaction } from '@/types'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'

interface PnlTableProps {
  data: Transaction[]
}

export function PnlTable({ data }: PnlTableProps) {
  const sortedData = [...data].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const totalRevenue = data.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <>
    {/* Desktop View */}
    <div className="hidden rounded-lg border md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="w-[120px]">{format(parseISO(transaction.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className="text-muted-foreground">{transaction.category}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold',
                    transaction.type === 'revenue'
                      ? 'text-primary'
                      : 'text-destructive'
                  )}
                >
                  {transaction.type === 'revenue' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {sortedData.length > 0 && (
          <TableFooter>
              <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">Total Revenue</TableCell>
                  <TableCell className="text-right font-bold text-primary">$ {totalRevenue.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">Total Expenses</TableCell>
                  <TableCell className="text-right font-bold text-destructive">$ {totalExpenses.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold text-lg">Net Profit</TableCell>
                  <TableCell className={cn("text-right font-bold text-lg", netProfit >= 0 ? 'text-foreground' : 'text-destructive')}>$ {netProfit.toFixed(2)}</TableCell>
              </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>

    {/* Mobile View */}
     <div className="grid gap-4 md:hidden">
        {sortedData.length > 0 ? (
          sortedData.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex justify-between items-start">
                  <div className="font-medium flex-1 pr-2">{transaction.description}</div>
                  <div className={cn(
                    'font-semibold',
                    transaction.type === 'revenue'
                      ? 'text-primary'
                      : 'text-destructive'
                  )}>
                  {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
              </div>
               <div className="text-sm text-muted-foreground mt-1">
                {transaction.category} &middot; {format(parseISO(transaction.date), 'MMM d, yyyy')}
              </div>
            </Card>
          ))
        ) : (
          <Card className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground">No transactions found.</p>
          </Card>
        )}
        
        {sortedData.length > 0 && (
          <Card className="p-4 bg-muted/50">
            <CardTitle className="text-lg mb-2">Summary</CardTitle>
            <CardContent className="p-0 space-y-2 text-sm">
                <div className="flex justify-between font-medium"><span>Total Revenue</span><span className="text-primary">${totalRevenue.toFixed(2)}</span></div>
                <div className="flex justify-between font-medium"><span>Total Expenses</span><span className="text-destructive">${totalExpenses.toFixed(2)}</span></div>
                <Separator className="my-1 bg-border" />
                <div className="flex justify-between font-bold text-base"><span>Net Profit</span><span className={cn(netProfit >= 0 ? 'text-foreground' : 'text-destructive')}>${netProfit.toFixed(2)}</span></div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
