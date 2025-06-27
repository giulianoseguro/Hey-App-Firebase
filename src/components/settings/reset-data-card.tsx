
'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-provider'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'

const RESET_PASSWORD = 'reset'
const DELETE_CONFIRMATION_TEXT = 'DELETE'

export function ResetDataCard() {
  const { resetAllData } = useData()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState('')
  const [confirmationText, setConfirmationText] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  
  const resetState = () => {
    setStep(1)
    setPassword('')
    setConfirmationText('')
    setOpen(false)
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetAllData()
      toast({
        title: 'Success!',
        description: 'All application data has been reset.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset data. Please try again.',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setIsResetting(false)
      resetState()
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                your data, including transactions, inventory, and payroll records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={resetState}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setStep(2)}>
                I understand, continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )
      case 2:
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Password Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                To proceed, please type the word <strong>`{RESET_PASSWORD}`</strong> in the box below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={resetState}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => setStep(3)}
                disabled={password !== RESET_PASSWORD}
              >
                Confirm Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )
      case 3:
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                This is your final warning. To permanently delete all data,
                type <strong>`{DELETE_CONFIRMATION_TEXT}`</strong> and click the reset button.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="confirmation">Type to confirm</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={resetState}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={confirmationText !== DELETE_CONFIRMATION_TEXT || isResetting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isResetting ? <LoaderCircle className="animate-spin" /> : 'Permanently Reset Data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )
      default:
        return null
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
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && resetState()}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Reset All Data</Button>
          </AlertDialogTrigger>
          <AlertDialogContent onEscapeKeyDown={(e) => { e.preventDefault(); resetState(); }}>
             {renderStepContent()}
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
