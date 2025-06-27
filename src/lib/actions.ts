'use server'

import { aiErrorWatch, type AiErrorWatchInput } from '@/ai/flows/ai-error-watch'
import { askGemini, type AskGeminiInput, type AskGeminiOutput } from '@/ai/flows/ask-gemini-flow';

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

export async function getGeminiResponse(input: AskGeminiInput): Promise<AskGeminiOutput> {
  try {
    const result = await askGemini(input);
    return result;
  } catch (error) {
    console.error('Gemini query failed:', error);
    return { answer: 'There was an error processing your request. Please try again.' };
  }
}
