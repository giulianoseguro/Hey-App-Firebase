
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { PayrollEntry } from '@/types'
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
  employeeName: z.string().min(1, 'Employee name is required.'),
  grossPay: z.coerce.number().positive('Gross pay must be a positive number.'),
  deductions: z.coerce.number().min(0, 'Deductions cannot be negative.'),
  payDate: z.string().min(1, 'Pay date is required.'),
})

type FormValues = z.infer<typeof formSchema>

interface EditPayrollEntryFormProps {
  payrollEntry: PayrollEntry
  onFinished: () => void
}

export function EditPayrollEntryForm({
  payrollEntry,
  onFinished,
}: EditPayrollEntryFormProps) {
  const { updatePayrollEntry } = useData()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: payrollEntry.employeeName,
      grossPay: payrollEntry.grossPay,
      deductions: payrollEntry.deductions,
      payDate: payrollEntry.payDate.split('T')[0], // Ensure YYYY-MM-DD format
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const dataToUpdate = { ...values, transactionId: payrollEntry.transactionId }
      await updatePayrollEntry(payrollEntry.id, dataToUpdate)
      toast({
        title: 'Success',
        description: 'Payroll entry updated successfully.',
      })
      onFinished()
    } catch (error) {
      console.error('Failed to save payroll entry:', error)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
