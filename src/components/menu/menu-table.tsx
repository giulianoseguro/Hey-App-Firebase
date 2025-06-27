
'use client'

import { useState } from 'react'
import type { MenuItem } from '@/types'
import { Edit, Trash2, PlusCircle } from 'lucide-react'

import { useData } from '@/lib/data-provider'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { EditMenuItemForm } from './edit-menu-item-form'

interface MenuTableProps {
  data: MenuItem[]
}

export function MenuTable({ data }: MenuTableProps) {
  const { deleteMenuItem } = useData()
  const { toast } = useToast()
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id)
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully.',
      })
    } catch (error) {
      console.error('Failed to delete menu item:', error)
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

  const handleEditFinished = () => {
    setEditingItem(null)
    setIsCreateDialogOpen(false)
  }

  return (
    <>
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
             <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Fill in the details for your new menu item.
              </DialogDescription>
            </DialogHeader>
            <EditMenuItemForm onFinished={handleEditFinished} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="w-[100px] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${(item.price - item.cost).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingItem(item)}
                    >
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
                            This action cannot be undone. This will permanently delete this menu item.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                          >
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
                <TableCell colSpan={5} className="h-24 text-center">
                  No menu items found. Click 'Add Menu Item' to start.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editingItem}
        onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Make changes to your menu item here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <EditMenuItemForm
              menuItem={editingItem}
              onFinished={handleEditFinished}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
