'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useData } from '@/lib/data-provider'
import { useToast } from '@/hooks/use-toast'
import { Upload } from 'lucide-react'

export function ImportDataButton() {
  const { importAllData } = useData()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        try {
          importAllData(text)
          toast({
            title: 'Success!',
            description: 'Data imported successfully.',
          })
        } catch (error) {
          toast({
            title: 'Import Failed',
            description:
              'The selected file is not valid. Please check the file and try again.',
            variant: 'destructive',
          })
        }
      }
    }
    reader.readAsText(file)
    // Reset file input so the same file can be loaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <Button onClick={handleButtonClick} variant="outline">
        <Upload className="mr-2 h-4 w-4" />
        Import Data
      </Button>
    </>
  )
}
