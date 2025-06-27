
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { InventoryItem } from '@/types'

import { useData } from '@/lib/data-provider'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  totalCost: z.coerce.number().positive('Total cost must be positive'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
})

type FormValues = z.infer<typeof formSchema>

interface EditInventoryItemFormProps {
  inventoryItem: InventoryItem
  onFinished: () => void
}

export function EditInventoryItemForm({
  inventoryItem,
  onFinished,
}: EditInventoryItemFormProps) {
  const { updateInventoryItem } = useData()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...inventoryItem,
      purchaseDate: inventoryItem.purchaseDate.split('T')[0],
      expiryDate: inventoryItem.expiryDate.split('T')[0],
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await updateInventoryItem(inventoryItem.id, values)
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully.',
      })
      onFinished()
    } catch (error) {
      console.error('Failed to save inventory item:', error)
      toast({
        title: 'Save Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred. Please check the console.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Item Name</FormLabel><FormControl><Input placeholder="e.g., Mozzarella" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="totalCost" render={({ field }) => (
                <FormItem><FormLabel>Total Cost ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
         <div className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel><FormControl><Input placeholder="e.g., kg, units" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
         <div className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                <FormItem><FormLabel>Purchase Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="expiryDate" render={({ field }) => (
                <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onFinished}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
}
