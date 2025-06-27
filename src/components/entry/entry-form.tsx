
'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { db } from '@/lib/firebase'
import { ref, push, child } from 'firebase/database'
import { Checkbox } from '@/components/ui/checkbox'

const BC_SALES_TAX_RATE = 0.12

const revenueSchema = z.object({
  menuItemId: z.string().min(1, 'Please select an item.'),
  quantity: z.coerce.number().positive('Quantity must be positive.'),
  date: z.string().min(1, 'Date is required'),
  includesTax: z.boolean(),
  customizationIds: z.array(z.string()).default([]),
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
  const { addTransactions, addInventoryItem, menuItems, customizations, isDataReady } = useData()
  const { toast } = useToast()
  const [aiErrors, setAiErrors] = useState<string[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])
  
  const revenueForm = useForm<z.infer<typeof revenueSchema>>({
    resolver: zodResolver(revenueSchema),
    defaultValues: { menuItemId: '', quantity: 1, date: '', includesTax: true, customizationIds: [] },
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
        revenueForm.reset({ menuItemId: '', quantity: 1, date: today, includesTax: true, customizationIds: [] });
        expenseForm.reset({ amount: 0, description: '', category: '', date: today });
        inventoryForm.reset({ name: '', quantity: 0, unit: '', totalCost: 0, purchaseDate: today, expiryDate: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const watchedRevenueForm = revenueForm.watch()
  const selectedMenuItem = menuItems.find(item => item.id === watchedRevenueForm.menuItemId)
  
  const selectedCustomizations = customizations.filter(c => watchedRevenueForm.customizationIds?.includes(c.id));
  const totalCustomizationPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
  const totalSaleAmount = selectedMenuItem ? (selectedMenuItem.price + totalCustomizationPrice) * watchedRevenueForm.quantity : 0;

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
    const selectedCustomizations = customizations.filter(c => values.customizationIds?.includes(c.id));

    if (!selectedMenuItem) {
      toast({ title: 'Error', description: 'Could not find selected menu item.', variant: 'destructive' })
      return;
    }
    if (!db) {
      toast({ title: 'Error', description: 'Database not connected.', variant: 'destructive' })
      return
    }

    const saleId = push(child(ref(db), 'sales')).key;
    if (!saleId) {
      toast({ title: 'Error', description: 'Could not generate a unique sale ID.', variant: 'destructive' })
      return;
    }

    const totalCustomizationPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
    const totalCustomizationCost = selectedCustomizations.reduce((sum, c) => sum + c.cost, 0);

    let finalSalePrice = (selectedMenuItem.price + totalCustomizationPrice) * values.quantity;
    const transactionsToAdd: Omit<import('/src/types').Transaction, 'id'>[] = [];
    
    if (values.includesTax) {
      const preTaxRevenue = finalSalePrice / (1 + BC_SALES_TAX_RATE);
      const taxAmount = finalSalePrice - preTaxRevenue;
      finalSalePrice = preTaxRevenue;
      
      transactionsToAdd.push({
        type: 'expense',
        date: values.date,
        amount: taxAmount,
        description: `Sales Tax for ${values.quantity} x ${selectedMenuItem.name}`,
        category: 'Taxes',
        saleId: saleId,
      });
    }

    const cogsAmount = (selectedMenuItem.cost + totalCustomizationCost) * values.quantity;
    transactionsToAdd.push({
      type: 'expense',
      date: values.date,
      amount: cogsAmount,
      description: `COGS for ${values.quantity} x ${selectedMenuItem.name}`,
      category: 'Cost of Goods Sold',
      saleId: saleId,
    });

    const customizationDescription = selectedCustomizations.length > 0
      ? ` (${selectedCustomizations.map(c => c.name).join(', ')})`
      : '';

    transactionsToAdd.push({
      type: 'revenue',
      date: values.date,
      amount: finalSalePrice,
      description: `Sale: ${values.quantity} x ${selectedMenuItem.name}${customizationDescription}`,
      category: 'Sales',
      menuItemId: values.menuItemId,
      quantity: values.quantity,
      saleId: saleId,
    });

    try {
      await addTransactions(transactionsToAdd);
      toast({ title: 'Success', description: `Sale of ${selectedMenuItem.name} recorded.` });
      revenueForm.reset({ menuItemId: '', quantity: 1, date: today, includesTax: true, customizationIds: [] });
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
                       <Select onValueChange={(value) => {
                            field.onChange(value);
                            revenueForm.setValue('customizationIds', []);
                       }} value={field.value}>
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
                {selectedMenuItem?.category === 'pizza' && customizations.length > 0 && (
                    <div className="space-y-2">
                        <Label>Customizations</Label>
                        <FormField
                            control={revenueForm.control}
                            name="customizationIds"
                            render={() => (
                                <FormItem className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                {customizations.map((item) => (
                                    <FormField
                                    key={item.id}
                                    control={revenueForm.control}
                                    name="customizationIds"
                                    render={({ field }) => {
                                        return (
                                        <FormItem key={item.id} className="flex flex-row items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, item.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.id
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">
                                            {item.name} (+${item.price.toFixed(2)})
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                                </FormItem>
                            )}
                        />
                    </div>
                )}
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
