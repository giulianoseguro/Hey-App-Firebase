'use client'

import * as React from 'react'
import { Pie, PieChart, Cell, Tooltip } from 'recharts'
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

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface ExpensesChartProps {
  data: Transaction[]
}

export function ExpensesChart({ data }: ExpensesChartProps) {
  const expenseData = React.useMemo(() => {
    const expensesByCategory = data
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0
        }
        acc[t.category] += t.amount
        return acc
      }, {} as { [key: string]: number })

    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const chartConfig = Object.fromEntries(
    expenseData.map((item, index) => [
      item.name,
      { label: item.name, color: COLORS[index % COLORS.length] },
    ])
  )
  
  const totalExpenses = React.useMemo(() => {
    return expenseData.reduce((acc, curr) => acc + curr.value, 0)
  }, [expenseData])


  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento de Despesas</CardTitle>
        <CardDescription>
          Uma análise de para onde seu dinheiro está indo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenseData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  index,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  if (percent < 0.05) return null; // Don't render small labels
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-bold fill-white"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
            Nenhum dado de despesa disponível.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
