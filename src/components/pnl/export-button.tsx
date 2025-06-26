'use client'

import { Button } from '@/components/ui/button'
import type { Transaction } from '@/types'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  data: Transaction[]
}

export function ExportButton({ data }: ExportButtonProps) {
  const exportToCsv = () => {
    const headers = 'ID,Tipo,Data,Descrição,Categoria,Valor\n'
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
    link.setAttribute('download', `lucros-perdas-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={exportToCsv} disabled={data.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  )
}
