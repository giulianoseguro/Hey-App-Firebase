
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '../ui/skeleton'

const BC_SALES_TAX_RATE = 0.12

const revenueSchema = z.object({
  menuItemId: z.string().min(1, 'Please select an item.'),
  quantity: z.coerce.number().positive('Quantity must be positive.'),
  date: z.string().min(1, 'Date is required'),
  includesTax: z.boolean(),
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
  const { addTransactions, addInventoryItem, menuItems, isDataReady } = useData()
  const { toast } = useToast()
  const [aiErrors, setAiErrors] = useState<string[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])
  
  const revenueForm = useForm<z.infer<typeof revenueSchema>>({
    resolver: zodResolver(revenueSchema),
    defaultValues: { menuItemId: '', quantity: 1, date: '', includesTax: true },
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
    if (today) {
        revenueForm.reset({ menuItemId: '', quantity: 1, date: today, includesTax: true });
        expenseForm.reset({ amount: 0, description: '', category: '', date: today });
        inventoryForm.reset({ name: '', quantity: 0, unit: '', totalCost: 0, purchaseDate: today, expiryDate: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const watchedRevenueForm = revenueForm.watch()
  const selectedMenuItem = menuItems.find(item => item.id === watchedRevenueForm.menuItemId)
  const totalSaleAmount = selectedMenuItem ? selectedMenuItem.price * watchedRevenueForm.quantity : 0;

  const formStateForAI = {
    revenue: JSON.stringify(watchedRevenueForm),
    expenses: JSON.stringify(expenseForm.watch()),
    inventory: JSON.stringify(inventoryForm.watch()),
  }

  const debouncedFormState = useDebounce(formStateForAI, 1000)

  const fetchAIAssistance = useCallback(async (state: typeof debouncedFormState) => {
    setIsAiLoading(true);
    try {
      const errors = await getAIAssistance(state);
      setAiErrors(errors);
    } catch (error) {
      console.error('AI assistance fetch failed:', error);
      setAiErrors(['Failed to get AI assistance.']);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedFormState) {
      const revenueData = JSON.parse(debouncedFormState.revenue);
      const hasInput = revenueData.menuItemId !== '' && revenueData.quantity > 0;
      if (hasInput) {
        fetchAIAssistance(debouncedFormState);
      } else {
        setAiErrors([]);
      }
    }
  }, [debouncedFormState, fetchAIAssistance]);

  const onRevenueSubmit = async (values: z.infer<typeof revenueSchema>) => {
    if (!selectedMenuItem) {
      toast({ title: 'Error', description: 'Could not find selected menu item.', variant: 'destructive' })
      return;
    }

    let revenueAmount = selectedMenuItem.price * values.quantity;
    const transactionsToAdd = [];
    
    if (values.includesTax) {
      const preTaxRevenue = revenueAmount / (1 + BC_SALES_TAX_RATE);
      const taxAmount = revenueAmount - preTaxRevenue;
      revenueAmount = preTaxRevenue;
      
      transactionsToAdd.push({
        type: 'expense',
        date: values.date,
        amount: taxAmount,
        description: `Sales Tax for ${values.quantity} x ${selectedMenuItem.name}`,
        category: 'Taxes',
      });
    }

    const cogsAmount = selectedMenuItem.cost * values.quantity;
    transactionsToAdd.push({
      type: 'expense',
      date: values.date,
      amount: cogsAmount,
      description: `COGS for ${values.quantity} x ${selectedMenuItem.name}`,
      category: 'Cost of Goods Sold',
    });

    transactionsToAdd.push({
      type: 'revenue',
      date: values.date,
      amount: revenueAmount,
      description: `Sale: ${values.quantity} x ${selectedMenuItem.name}`,
      category: 'Sales',
      menuItemId: values.menuItemId,
      quantity: values.quantity
    });

    try {
      await addTransactions(transactionsToAdd);
      toast({ title: 'Success', description: `Sale of ${selectedMenuItem.name} recorded.` });
      revenueForm.reset({ menuItemId: '', quantity: 1, date: today, includesTax: true });
    } catch (error) {
       toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please check the console.',
        variant: 'destructive',
      });
    }
  }

  const onExpenseSubmit = async (values: z.infer<typeof expenseSchema>) => {
    try {
      await addTransactions([{ type: 'expense', ...values }]);
      toast({ title: 'Success', description: 'Expense added successfully.' });
      expenseForm.reset({ amount: 0, description: '', category: '', date: today });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please check the console.',
        variant: 'destructive',
      });
    }
  }
  
  const onInventorySubmit = async (values: z.infer<typeof inventorySchema>) => {
    try {
      await addInventoryItem(values);
      toast({ title: 'Success', description: 'Inventory item and expense added successfully.' });
      inventoryForm.reset({ name: '', quantity: 0, unit: '', totalCost: 0, purchaseDate: today, expiryDate: '' });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please check the console.',
        variant: 'destructive',
      });
    }
  }

  if (!isDataReady) {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="lg:col-span-1">
                <div className="sticky top-24">
                <Skeleton className="h-[188px] w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Revenue</CardTitle>
            <CardDescription>Record a sale from your menu.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...revenueForm}>
              <form onSubmit={revenueForm.handleSubmit(onRevenueSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={revenueForm.control} name="menuItemId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Item</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {menuItems.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={revenueForm.control} name="quantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                   <FormField control={revenueForm.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="space-y-2">
                    <Label>Total Sale</Label>
                    <Input readOnly value={`$${totalSaleAmount.toFixed(2)}`} className="font-semibold" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                    <FormField control={revenueForm.control} name="includesTax" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-2 bg-background">
                        <div className="space-y-0.5">
                            <FormLabel>Price includes 12% Sales Tax (BC)?</FormLabel>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )} />
                </div>
                <Button type="submit">Add Sale</Button>
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
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Rent, Utilities" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={expenseForm.control} name="date" render={({ field }) => (
                        <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={expenseForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Monthly rent payment" {...field} /></FormControl><FormMessage /></FormItem>
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
