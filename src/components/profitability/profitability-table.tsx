
'use client'
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import type { MenuItem, Transaction } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'

interface ProfitabilityTableProps {
  menuItems: MenuItem[];
  transactions: Transaction[];
}

interface ProfitabilityData {
    id: string;
    name: string;
    unitsSold: number;
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
}

export function ProfitabilityTable({ menuItems, transactions }: ProfitabilityTableProps) {

  const profitabilityData = React.useMemo(() => {
    const data: ProfitabilityData[] = menuItems.map(item => {
        const relevantSales = transactions.filter(t => t.type === 'revenue' && t.menuItemId === item.id);
        
        const unitsSold = relevantSales.reduce((sum, t) => sum + (t.quantity || 0), 0);
        const totalRevenue = relevantSales.reduce((sum, t) => sum + t.amount, 0);

        // COGS are now also logged as expenses, so we find them there
        const relevantCogs = transactions.filter(t => t.type === 'expense' && t.category === 'Cost of Goods Sold' && t.description.includes(item.name))
        const totalCost = relevantCogs.reduce((sum, t) => sum + t.amount, 0)
        
        const netProfit = totalRevenue - totalCost;

        return {
            id: item.id,
            name: item.name,
            unitsSold,
            totalRevenue,
            totalCost,
            netProfit,
        }
    });
    return data;
  }, [menuItems, transactions]);

  const totals = React.useMemo(() => {
    return profitabilityData.reduce((acc, item) => {
        acc.unitsSold += item.unitsSold;
        acc.totalRevenue += item.totalRevenue;
        acc.totalCost += item.totalCost;
        acc.netProfit += item.netProfit;
        return acc;
    }, { unitsSold: 0, totalRevenue: 0, totalCost: 0, netProfit: 0 });
  }, [profitabilityData]);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu Item</TableHead>
              <TableHead className="text-right">Units Sold</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
              <TableHead className="text-right">Total Cost (COGS)</TableHead>
              <TableHead className="text-right">Net Profit</TableHead>
              <TableHead className="text-right">Profit Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profitabilityData.length > 0 ? (
              profitabilityData.map((item) => {
                const profitMargin = item.totalRevenue > 0 ? (item.netProfit / item.totalRevenue) * 100 : 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.unitsSold}</TableCell>
                    <TableCell className="text-right text-primary">${item.totalRevenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-destructive">${item.totalCost.toFixed(2)}</TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      item.netProfit >= 0 ? "text-foreground" : "text-destructive"
                    )}>
                      ${item.netProfit.toFixed(2)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      profitMargin >= 0 ? "text-foreground" : "text-destructive"
                    )}>
                      {profitMargin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No sales data to analyze. Add sales from the Data Entry page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {profitabilityData.length > 0 && (
            <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">Totals</TableCell>
                    <TableCell className="text-right font-bold">{totals.unitsSold}</TableCell>
                    <TableCell className="text-right font-bold text-primary">${totals.totalRevenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">${totals.totalCost.toFixed(2)}</TableCell>
                    <TableCell className={cn("text-right font-bold", totals.netProfit >= 0 ? "text-foreground" : "text-destructive")}>${totals.netProfit.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">
                        {totals.totalRevenue > 0 ? `${((totals.netProfit / totals.totalRevenue) * 100).toFixed(1)}%` : '0.0%'}
                    </TableCell>
                </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {profitabilityData.length > 0 ? (
          profitabilityData.map((item) => {
            const profitMargin = item.totalRevenue > 0 ? (item.netProfit / item.totalRevenue) * 100 : 0;
            return (
              <Card key={item.id} className="p-4">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.unitsSold} units sold</div>
                <Separator className="my-2" />
                <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span>Total Revenue:</span><span className="font-medium text-primary">${item.totalRevenue.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Total Cost:</span><span className="font-medium text-destructive">${item.totalCost.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold mt-1 pt-1 border-t">
                        <span>Net Profit:</span>
                        <span className={cn(item.netProfit >= 0 ? "text-foreground" : "text-destructive")}>${item.netProfit.toFixed(2)} ({profitMargin.toFixed(1)}%)</span>
                    </div>
                </div>
              </Card>
            )
          })
        ) : (
          <Card className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground">No sales data to analyze.</p>
          </Card>
        )}

        {profitabilityData.length > 0 && (
          <Card className="p-4 bg-muted/50">
            <CardTitle className="text-lg mb-2">Total Profitability</CardTitle>
            <CardContent className="p-0 space-y-2 text-sm">
                <div className="flex justify-between font-medium"><span>Total Units Sold:</span><span className="text-foreground">{totals.unitsSold}</span></div>
                <div className="flex justify-between font-medium"><span>Total Revenue:</span><span className="text-primary">${totals.totalRevenue.toFixed(2)}</span></div>
                <div className="flex justify-between font-medium"><span>Total Cost:</span><span className="text-destructive">${totals.totalCost.toFixed(2)}</span></div>
                <Separator className="my-1 bg-border" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Net Profit:</span>
                  <span className={cn(totals.netProfit >= 0 ? "text-foreground" : "text-destructive")}>${totals.netProfit.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-base">
                  <span>Overall Margin:</span>
                  <span className={cn(totals.netProfit >= 0 ? "text-foreground" : "text-destructive")}>
                    {totals.totalRevenue > 0 ? `${((totals.netProfit / totals.totalRevenue) * 100).toFixed(1)}%` : '0.0%'}
                  </span>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
