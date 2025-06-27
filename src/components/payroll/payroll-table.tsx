
'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useData } from '@/lib/data-provider'
import { useToast } from '@/hooks/use-toast'
import { EditPayrollEntryForm } from './edit-payroll-entry-form'

interface PayrollTableProps {
  data: PayrollEntry[]
}

export function PayrollTable({ data }: PayrollTableProps) {
  const { deletePayrollEntry } = useData()
  const { toast } = useToast()
  const [editingEntry, setEditingEntry] = useState<PayrollEntry | null>(null)

  const sortedData = [...data].sort((a, b) => parseISO(b.payDate).getTime() - parseISO(a.payDate).getTime())

  const totals = data.reduce((acc, entry) => {
    acc.grossPay += entry.grossPay;
    acc.deductions += entry.deductions;
    acc.netPay += entry.netPay;
    return acc;
  }, { grossPay: 0, deductions: 0, netPay: 0 });

  const handleDelete = async (entry: PayrollEntry) => {
    try {
      await deletePayrollEntry(entry)
      toast({
        title: 'Success',
        description: 'Payroll entry deleted successfully.',
      })
    } catch (error) {
       toast({
        title: 'Delete Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead className="text-right">Gross Pay</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Net Pay</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => setEditingEntry(entry)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Entry</span>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Entry</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the payroll entry and its associated transaction.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(entry)}>
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
                  <TableCell />
              </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={!!editingEntry} onOpenChange={(isOpen) => !isOpen && setEditingEntry(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Payroll Entry</DialogTitle>
                <DialogDescription>
                    Make changes to the payroll entry here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            {editingEntry && (
                <EditPayrollEntryForm payrollEntry={editingEntry} onFinished={() => setEditingEntry(null)} />
            )}
        </DialogContent>
      </Dialog>
    </>
  )
}
