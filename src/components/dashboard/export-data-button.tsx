'use client'

import { Button } from '@/components/ui/button'
import { useData } from '@/lib/data-provider'
import { Download } from 'lucide-react'

export function ExportDataButton() {
  const { exportAllData } = useData()

  return (
    <Button onClick={exportAllData} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export Data
    </Button>
  )
}
