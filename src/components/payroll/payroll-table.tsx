'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import type { PayrollEntry } from '@/types'
import { format, parseISO } from 'date-fns'

interface PayrollTableProps {
  data: PayrollEntry[]
}

export function PayrollTable({ data }: PayrollTableProps) {
  const sortedData = [...data].sort((a, b) => parseISO(b.payDate).getTime() - parseISO(a.payDate).getTime())

  const totals = data.reduce((acc, entry) => {
    acc.grossPay += entry.grossPay;
    acc.deductions += entry.deductions;
    acc.netPay += entry.netPay;
    return acc;
  }, { grossPay: 0, deductions: 0, netPay: 0 });

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Pay Date</TableHead>
            <TableHead className="text-right">Gross Pay</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-right">Net Pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.employeeName}</TableCell>
                <TableCell>{format(parseISO(entry.payDate), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">${entry.grossPay.toFixed(2)}</TableCell>
                <TableCell className="text-right text-destructive">${entry.deductions.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">${entry.netPay.toFixed(2)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No payroll entries yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
            <TableRow>
                <TableCell colSpan={2} className="font-bold text-right">Totals</TableCell>
                <TableCell className="text-right font-bold">${totals.grossPay.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold text-destructive">${totals.deductions.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold">${totals.netPay.toFixed(2)}</TableCell>
            </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
