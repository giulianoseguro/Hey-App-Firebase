'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useData } from '@/lib/data-provider'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'

const payrollSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required.'),
  grossPay: z.coerce.number().positive('Gross pay must be a positive number.'),
  deductions: z.coerce.number().min(0, 'Deductions cannot be negative.'),
  payDate: z.string().min(1, 'Pay date is required.'),
})

export function PayrollForm() {
  const { addPayrollEntry, isDbConnected } = useData()
  const { toast } = useToast()
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

  const form = useForm<z.infer<typeof payrollSchema>>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeName: '',
      grossPay: 0,
      deductions: 0,
      payDate: '',
    },
  })

  useEffect(() => {
    if (today) {
      form.reset({
        employeeName: '',
        grossPay: 0,
        deductions: 0,
        payDate: today,
      })
    }
  }, [today, form])

  const watchedGrossPay = form.watch('grossPay')
  const watchedDeductions = form.watch('deductions')
  const netPay = watchedGrossPay - watchedDeductions

  function onSubmit(values: z.infer<typeof payrollSchema>) {
    addPayrollEntry(values)
    toast({
      title: 'Success',
      description: `Payroll for ${values.employeeName} has been recorded.`,
    })
    form.reset({
        employeeName: '',
        grossPay: 0,
        deductions: 0,
        payDate: today,
      })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Payroll Entry</CardTitle>
        <CardDescription>Record a new payroll payment.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grossPay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Pay ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deductions ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2 rounded-md border bg-muted/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net Pay</span>
                <span className="font-semibold">${netPay.toFixed(2)}</span>
              </div>
            </div>
             <FormField
                control={form.control}
                name="payDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Button type="submit" className="w-full" disabled={!isDbConnected}>
              Record Payroll
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
