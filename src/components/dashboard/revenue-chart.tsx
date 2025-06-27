'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { Transaction } from '@/types'
import { format, parseISO, startOfMonth } from 'date-fns'

interface RevenueChartProps {
  data: Transaction[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = React.useMemo(() => {
    const monthlyData = data.reduce((acc, t) => {
      const month = format(startOfMonth(parseISO(t.date)), 'MMM yyyy')
      if (!acc[month]) {
        acc[month] = { name: month, revenue: 0, expenses: 0 }
      }
      if (t.type === 'revenue') {
        acc[month].revenue += t.amount
      } else {
        acc[month].expenses += t.amount
      }
      return acc
    }, {} as { [key: string]: { name: string; revenue: number; expenses: number } })

    return Object.values(monthlyData).sort((a,b) => new Date(a.name) > new Date(b.name) ? 1 : -1);
  }, [data])

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
    expenses: {
      label: 'Expenses',
      color: 'hsl(var(--chart-2))',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs. Expenses</CardTitle>
        <CardDescription>
          A monthly overview of your revenue and expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
      {chartData.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
         ) : (
          <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
            No revenue or expense data available.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
