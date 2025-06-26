'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import type { Transaction } from '@/types'
import { Download } from 'lucide-react'

interface ExportButtonProps extends ButtonProps {
  data: Transaction[]
}

export function ExportButton({ data, ...props }: ExportButtonProps) {
  const exportToCsv = () => {
    const headers = 'ID,Type,Date,Description,Category,Amount\n'
    const csvContent = data
      .map(
        (t) =>
          `${t.id},${t.type},${t.date},"${t.description}",${t.category},${t.amount}`
      )
      .join('\n')

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `profit-loss-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={exportToCsv} {...props}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}
