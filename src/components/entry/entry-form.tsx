'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useData } from '@/lib/data-provider'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import { getAIAssistance } from '@/lib/actions'
import { AiAssistant } from './ai-assistant'

const revenueSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
})

const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
})

const inventorySchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  totalCost: z.coerce.number().positive('Total cost must be positive'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
})

export function EntryForm() {
  const { addTransaction, addInventoryItem } = useData()
  const { toast } = useToast()
  const [aiErrors, setAiErrors] = useState<string[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)
  
  const revenueForm = useForm<z.infer<typeof revenueSchema>>({
    resolver: zodResolver(revenueSchema),
    defaultValues: { amount: 0, description: '', date: '' },
  })

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { amount: 0, description: '', category: '', date: '' },
  })
  
  const inventoryForm = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { name: '', quantity: 0, unit: '', totalCost: 0, purchaseDate: '', expiryDate: '' },
  })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    revenueForm.reset({ amount: 0, description: '', date: today });
    expenseForm.reset({ amount: 0, description: '', category: '', date: today });
    inventoryForm.reset({ name: '', quantity: 0, unit: '', totalCost: 0, purchaseDate: today, expiryDate: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const formStateForAI = {
    revenue: JSON.stringify(revenueForm.watch()),
    expenses: JSON.stringify(expenseForm.watch()),
    inventory: JSON.stringify(inventoryForm.watch()),
  }

  const debouncedFormState = useDebounce(formStateForAI, 1000)

  useEffect(() => {
    let isCancelled = false;

    const fetchAIAssistance = async () => {
      if (!debouncedFormState) return;

      const revenueData = JSON.parse(debouncedFormState.revenue);
      const expenseData = JSON.parse(debouncedFormState.expenses);
      const inventoryData = JSON.parse(debouncedFormState.inventory);

      const hasInput =
        revenueData.amount > 0 ||
        revenueData.description !== '' ||
        expenseData.amount > 0 ||
        expenseData.description !== '' ||
        expenseData.category !== '' ||
        inventoryData.name !== '' ||
        inventoryData.quantity > 0 ||
        inventoryData.unit !== '' ||
        inventoryData.totalCost > 0;

      if (!hasInput) {
        setAiErrors([]);
        setIsAiLoading(false);
        return;
      }

      setIsAiLoading(true);
      try {
        const errors = await getAIAssistance(debouncedFormState);
        if (!isCancelled) {
          setAiErrors(errors);
        }
      } catch (error) {
        console.error('AI assistance fetch failed:', error);
        if(!isCancelled) {
          setAiErrors(['Failed to get AI assistance.']);
        }
      } finally {
        if (!isCancelled) {
          setIsAiLoading(false);
        }
      }
    };

    fetchAIAssistance();

    return () => {
      isCancelled = true;
    };
  }, [debouncedFormState]);


  const onRevenueSubmit = (values: z.infer<typeof revenueSchema>) => {
    addTransaction({ type: 'revenue', category: 'Sales', ...values })
    toast({ title: 'Success', description: 'Revenue added successfully.' })
    revenueForm.reset({ amount: 0, description: '', date: new Date().toISOString().split('T')[0] })
  }

  const onExpenseSubmit = (values: z.infer<typeof expenseSchema>) => {
    addTransaction({ type: 'expense', ...values })
    toast({ title: 'Success', description: 'Expense added successfully.' })
    expenseForm.reset({ amount: 0, description: '', category: '', date: new Date().toISOString().split('T')[0] })
  }
  
  const onInventorySubmit = (values: z.infer<typeof inventorySchema>) => {
    addInventoryItem(values)
    toast({ title: 'Success', description: 'Inventory item and expense added successfully.' })
    inventoryForm.reset({ name: '', quantity: 0, unit: '', totalCost: 0, purchaseDate: new Date().toISOString().split('T')[0], expiryDate: '' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Revenue</CardTitle>
            <CardDescription>Record money coming into your business.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...revenueForm}>
              <form onSubmit={revenueForm.handleSubmit(onRevenueSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={revenueForm.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={revenueForm.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 <FormField control={revenueForm.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Input placeholder="e.g., Daily sales" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <Button type="submit">Add Revenue</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
            <CardDescription>Record money spent by your business.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                 <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={expenseForm.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={expenseForm.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Ingredients" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={expenseForm.control} name="date" render={({ field }) => (
                        <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={expenseForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Flour, cheese, tomatoes" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit">Add Expense</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add to Inventory</CardTitle>
            <CardDescription>Add new items to your stock. This will also create an expense entry.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...inventoryForm}>
              <form onSubmit={inventoryForm.handleSubmit(onInventorySubmit)} className="space-y-4">
                 <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={inventoryForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Item Name</FormLabel><FormControl><Input placeholder="e.g., Mozzarella" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={inventoryForm.control} name="totalCost" render={({ field }) => (
                        <FormItem><FormLabel>Total Cost ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={inventoryForm.control} name="quantity" render={({ field }) => (
                        <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={inventoryForm.control} name="unit" render={({ field }) => (
                        <FormItem><FormLabel>Unit</FormLabel><FormControl><Input placeholder="e.g., kg, units" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={inventoryForm.control} name="purchaseDate" render={({ field }) => (
                        <FormItem><FormLabel>Purchase Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={inventoryForm.control} name="expiryDate" render={({ field }) => (
                        <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit">Add to Inventory</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24">
            <AiAssistant errors={aiErrors} isLoading={isAiLoading} />
        </div>
      </div>
    </div>
  )
}
