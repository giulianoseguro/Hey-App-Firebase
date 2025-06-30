
'use client'

import { useState } from 'react'
import type { Transaction } from '@/types'
import { format, parseISO } from 'date-fns'
import { Edit, Trash2, ArrowUp, ArrowDown, Upload } from 'lucide-react'

import { useData } from '@/lib/data-provider'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EditTransactionForm } from './edit-transaction-form'
import { Card } from '../ui/card'

interface TransactionsTableProps {
  data: Transaction[]
  requestSort: (key: keyof Transaction) => void
  sortConfig: { key: keyof Transaction; direction: 'ascending' | 'descending' } | null
}

const MANAGED_CATEGORIES = ['Payroll', 'Cost of Goods Sold', 'Taxes', 'Inventory Purchase'];

export function TransactionsTable({ data, requestSort, sortConfig }: TransactionsTableProps) {
  const { deleteTransaction } = useData()
  const { toast } = useToast()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      toast({
        title: 'Success',
        description: 'Transaction and any linked entries have been deleted.',
      })
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast({
        title: 'Delete Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred. Please check the console.',
        variant: 'destructive',
      })
    }
  }

  const getTooltipContent = (transaction: Transaction) => {
    switch (transaction.category) {
      case 'Payroll':
        return 'This is a payroll expense. Please manage it on the Payroll page.'
      case 'Cost of Goods Sold':
      case 'Taxes':
        return 'This is part of a sale. It cannot be edited individually.'
      case 'Inventory Purchase':
        return 'This was created from an inventory entry. Manage it from the Inventory page.'
      case 'Sales': // This is the revenue category
        return "Sales revenue cannot be edited directly. Please delete this entry and create a new one if needed."
      default:
        return 'This transaction cannot be edited directly.'
    }
  }

  const getDeletionAlertDescription = (transaction: Transaction) => {
    if (transaction.saleId) {
        return 'This action cannot be undone. This will permanently delete this transaction and all linked sale entries (COGS, Taxes).'
    }
    if (transaction.category === 'Inventory Purchase') {
        return 'This action cannot be undone. This will permanently delete this expense and the linked item in your inventory.'
    }
    if (transaction.category === 'Payroll') {
        return 'This action cannot be undone. This will permanently delete this expense and the linked entry on the payroll page.'
    }
    return 'This action cannot be undone. This will permanently delete this transaction.'
  }

  const getSortIndicator = (key: keyof Transaction) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    return <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <>
      <TooltipProvider>
        {/* Desktop View */}
        <div className="hidden rounded-lg border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[120px] cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date {getSortIndicator('date')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('description')}
                >
                  <div className="flex items-center">
                    Description {getSortIndicator('description')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('type')}
                >
                  <div className="flex items-center">
                    Type {getSortIndicator('type')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('category')}
                >
                  <div className="flex items-center">
                    Category {getSortIndicator('category')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right hover:bg-muted/50"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Amount {getSortIndicator('amount')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((transaction) => {
                  const isEditable = !MANAGED_CATEGORIES.includes(transaction.category) && transaction.type !== 'revenue'

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="w-[120px]">
                        {format(parseISO(transaction.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {transaction.type}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.category}
                      </TableCell>
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
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={!isEditable ? 0 : -1}>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!isEditable}
                                onClick={() => isEditable && setEditingTransaction(transaction)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Transaction</span>
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!isEditable && <TooltipContent><p>{getTooltipContent(transaction)}</p></TooltipContent>}
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => console.log('Upload receipt for', transaction.id)}>
                              <Upload className="h-4 w-4" />
                              <span className="sr-only">Upload Receipt</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Upload Receipt</TooltipContent>
                        </Tooltip>


                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete Transaction</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {getDeletionAlertDescription(transaction)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
          {data.length > 0 ? (
            data.map((transaction) => {
              const isEditable = !MANAGED_CATEGORIES.includes(transaction.category) && transaction.type !== 'revenue';
              return (
                <Card key={transaction.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <div className="font-medium line-clamp-1">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground capitalize">{transaction.category}</div>
                    </div>
                    <div className="flex items-center -mr-2">
                       <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={!isEditable ? 0 : -1}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={!isEditable}
                                onClick={() => isEditable && setEditingTransaction(transaction)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Transaction</span>
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!isEditable && <TooltipContent><p>{getTooltipContent(transaction)}</p></TooltipContent>}
                        </Tooltip>

                         <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => console.log('Upload receipt for', transaction.id)}>
                              <Upload className="h-4 w-4" />
                              <span className="sr-only">Upload Receipt</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Upload Receipt</TooltipContent>
                        </Tooltip>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete Transaction</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {getDeletionAlertDescription(transaction)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>
                   <div className="flex justify-between items-end mt-2 pt-2 border-t">
                    <div className="text-sm text-muted-foreground">{format(parseISO(transaction.date), 'MMM d, yyyy')}</div>
                    <div className={cn(
                      'font-semibold',
                      transaction.type === 'revenue'
                        ? 'text-primary'
                        : 'text-destructive'
                    )}>
                      {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="flex h-24 items-center justify-center">
                <p className="text-muted-foreground">No transactions found.</p>
            </Card>
          )}
        </div>
      </TooltipProvider>

      <Dialog
        open={!!editingTransaction}
        onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Make changes to your transaction here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <EditTransactionForm
              transaction={editingTransaction}
              onFinished={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
