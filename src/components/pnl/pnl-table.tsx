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

interface PnlTableProps {
  data: Transaction[]
}

export function PnlTable({ data }: PnlTableProps) {
  const sortedData = [...data].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const totalRevenue = data.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
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
                  {transaction.type === 'revenue' ? '+' : '-'}R$
                  {transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
            <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">Receita Total</TableCell>
                <TableCell className="text-right font-bold text-primary">R$ {totalRevenue.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">Despesas Totais</TableCell>
                <TableCell className="text-right font-bold text-destructive">R$ {totalExpenses.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={3} className="text-right font-bold text-lg">Lucro Líquido</TableCell>
                <TableCell className={cn("text-right font-bold text-lg", netProfit >= 0 ? 'text-foreground' : 'text-destructive')}>R$ {netProfit.toFixed(2)}</TableCell>
            </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
