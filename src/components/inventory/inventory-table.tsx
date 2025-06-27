
'use client'

import { useState } from 'react'
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
import { useData } from '@/lib/data-provider'
import { useToast } from '@/hooks/use-toast'
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
import { EditInventoryItemForm } from './edit-inventory-item-form'


interface InventoryTableProps {
  data: InventoryItem[]
}

const LOW_STOCK_THRESHOLD = 10;
const EXPIRY_SOON_THRESHOLD_DAYS = 7;

export function InventoryTable({ data }: InventoryTableProps) {
  const { deleteInventoryItem } = useData()
  const { toast } = useToast()
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
    
  const getStatus = (item: InventoryItem) => {
    const daysToExpiry = differenceInDays(parseISO(item.expiryDate), new Date())
    const isLowStock = item.quantity < LOW_STOCK_THRESHOLD

    if (daysToExpiry < 0) return { text: 'Expired', variant: 'destructive' } as const
    if (daysToExpiry <= EXPIRY_SOON_THRESHOLD_DAYS) return { text: `Expires in ${daysToExpiry}d`, variant: 'destructive' } as const
    if (isLowStock) return { text: 'Low Stock', variant: 'secondary' } as const
    
    return null
  }

  const handleDelete = async (item: InventoryItem) => {
    try {
      await deleteInventoryItem(item)
      toast({
        title: 'Success',
        description: 'Inventory item and linked transaction deleted.',
      })
    } catch (error) {
       toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      })
    }
  }

  const sortedData = [...data].sort((a, b) => differenceInDays(parseISO(a.expiryDate), new Date()) - differenceInDays(parseISO(b.expiryDate), new Date()));

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Item</span>
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete Item</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This will permanently delete the inventory item and its associated expense transaction.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item)}>
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
                  No items in stock.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Inventory Item</DialogTitle>
                <DialogDescription>
                    Make changes to the item here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            {editingItem && (
                <EditInventoryItemForm inventoryItem={editingItem} onFinished={() => setEditingItem(null)} />
            )}
        </DialogContent>
      </Dialog>
    </>
  )
}
