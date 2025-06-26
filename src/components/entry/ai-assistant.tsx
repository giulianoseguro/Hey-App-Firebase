'use client'

import { Lightbulb, LoaderCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AiAssistantProps {
  errors: string[]
  isLoading: boolean
}

export function AiAssistant({ errors, isLoading }: AiAssistantProps) {
  return (
    <Card className="bg-accent/50 border-accent">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Lightbulb className="h-5 w-5 text-accent-foreground" />
        <CardTitle className="text-accent-foreground">AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : errors.length > 0 ? (
          <ul className="space-y-2 text-sm text-accent-foreground/90">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{error}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Everything looks good so far! I'll let you know if I spot any potential issues.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
