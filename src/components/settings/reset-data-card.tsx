
'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-provider'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'

const DELETE_CONFIRMATION_TEXT = 'DELETE'

export function ResetDataCard() {
  const { resetAllData } = useData()
  const { toast } = useToast()
  const [confirmationText, setConfirmationText] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the dialog from closing immediately on click
    event.preventDefault()
    
    if (confirmationText !== DELETE_CONFIRMATION_TEXT) {
      return
    }

    setIsResetting(true)
    try {
      await resetAllData()
      toast({
        title: 'Success!',
        description: 'All application data has been reset.',
      })
      // Manually close the dialog on success by finding the cancel button
      // This is a workaround to control closing behavior after async op
      const cancelButton = document.querySelector('[data-radix-collection-item] [data-radix-cancel-button]') as HTMLButtonElement | null;
      cancelButton?.click()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset data. Please try again.',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setIsResetting(false)
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationText('')
      setIsResetting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Reset All Data</CardTitle>
        <CardDescription>
          Permanently delete all data from your application. This action is
          irreversible.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <AlertDialog onOpenChange={handleOpenChange}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Reset All Data</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
             <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                your data. To proceed, type <strong>`{DELETE_CONFIRMATION_TEXT}`</strong> in the box below and click Reset.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="confirmation" className="sr-only">Type to confirm</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Type "${DELETE_CONFIRMATION_TEXT}" to confirm`}
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel data-radix-cancel-button>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={confirmationText !== DELETE_CONFIRMATION_TEXT || isResetting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isResetting ? <LoaderCircle className="animate-spin" /> : 'Reset All Data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
