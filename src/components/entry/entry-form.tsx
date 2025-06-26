'use client'

import { useState, useTransition, useEffect } from 'react'
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
  amount: z.coerce.number().positive('O valor deve ser positivo'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.string().min(1, 'A data é obrigatória'),
})

const expenseSchema = z.object({
  amount: z.coerce.number().positive('O valor deve ser positivo'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  date: z.string().min(1, 'A data é obrigatória'),
})

const inventorySchema = z.object({
  name: z.string().min(1, 'O nome do item é obrigatório'),
  quantity: z.coerce.number().positive('A quantidade deve ser positiva'),
  unit: z.string().min(1, 'A unidade é obrigatória'),
  purchaseDate: z.string().min(1, 'A data de compra é obrigatória'),
  expiryDate: z.string().min(1, 'A data de validade é obrigatória'),
})

export function EntryForm() {
  const { addTransaction, addInventoryItem } = useData()
  const { toast } = useToast()
  const [aiErrors, setAiErrors] = useState<string[]>([])
  const [isAiLoading, startAiTransition] = useTransition()
  
  const revenueForm = useForm<z.infer<typeof revenueSchema>>({
    resolver: zodResolver(revenueSchema),
    defaultValues: { amount: 0, description: '', date: new Date().toISOString().split('T')[0] },
  })

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { amount: 0, description: '', category: '', date: new Date().toISOString().split('T')[0] },
  })
  
  const inventoryForm = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { name: '', quantity: 0, unit: '', purchaseDate: new Date().toISOString().split('T')[0], expiryDate: '' },
  })

  const formStateForAI = {
    revenue: JSON.stringify(revenueForm.watch()),
    expenses: JSON.stringify(expenseForm.watch()),
    inventory: JSON.stringify(inventoryForm.watch()),
  }

  const debouncedFormState = useDebounce(formStateForAI, 1000)

  useEffect(() => {
    if(debouncedFormState.revenue || debouncedFormState.expenses || debouncedFormState.inventory) {
      startAiTransition(async () => {
        const errors = await getAIAssistance(debouncedFormState)
        setAiErrors(errors)
      })
    }
  }, [debouncedFormState])


  const onRevenueSubmit = (values: z.infer<typeof revenueSchema>) => {
    addTransaction({ type: 'revenue', category: 'Sales', ...values })
    toast({ title: 'Sucesso', description: 'Receita adicionada com sucesso.' })
    revenueForm.reset()
  }

  const onExpenseSubmit = (values: z.infer<typeof expenseSchema>) => {
    addTransaction({ type: 'expense', ...values })
    toast({ title: 'Sucesso', description: 'Despesa adicionada com sucesso.' })
    expenseForm.reset()
  }
  
  const onInventorySubmit = (values: z.infer<typeof inventorySchema>) => {
    addInventoryItem(values)
    toast({ title: 'Sucesso', description: 'Item de estoque adicionado com sucesso.' })
    inventoryForm.reset()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Receita</CardTitle>
            <CardDescription>Registre o dinheiro que entra no seu negócio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...revenueForm}>
              <form onSubmit={revenueForm.handleSubmit(onRevenueSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={revenueForm.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={revenueForm.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 <FormField control={revenueForm.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl><Input placeholder="ex: Vendas do dia" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <Button type="submit">Adicionar Receita</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Despesa</CardTitle>
            <CardDescription>Registre o dinheiro gasto pelo seu negócio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                 <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={expenseForm.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={expenseForm.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="ex: Ingredientes" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={expenseForm.control} name="date" render={({ field }) => (
                        <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={expenseForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="ex: Farinha, queijo, tomates" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit">Adicionar Despesa</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar ao Estoque</CardTitle>
            <CardDescription>Adicione novos itens ao seu estoque.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...inventoryForm}>
              <form onSubmit={inventoryForm.handleSubmit(onInventorySubmit)} className="space-y-4">
                 <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={inventoryForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nome do Item</FormLabel><FormControl><Input placeholder="ex: Muçarela" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={inventoryForm.control} name="quantity" render={({ field }) => (
                        <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={inventoryForm.control} name="unit" render={({ field }) => (
                        <FormItem><FormLabel>Unidade</FormLabel><FormControl><Input placeholder="ex: kg, unidades" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={inventoryForm.control} name="purchaseDate" render={({ field }) => (
                        <FormItem><FormLabel>Data da Compra</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={inventoryForm.control} name="expiryDate" render={({ field }) => (
                        <FormItem><FormLabel>Data de Validade</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit">Adicionar ao Estoque</Button>
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
