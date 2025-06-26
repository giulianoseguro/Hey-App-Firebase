'use server'

import { aiErrorWatch, type AiErrorWatchInput } from '@/ai/flows/ai-error-watch'

export async function getAIAssistance(input: AiErrorWatchInput): Promise<string[]> {
  try {
    const result = await aiErrorWatch(input)
    return result.errors
  } catch (error) {
    console.error('AI Error Watch failed:', error)
    // Return a user-friendly error message, but avoid exposing internal details.
    return ['An error occurred while getting AI assistance. Please try again.']
  }
}
