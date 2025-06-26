'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI assistant that watches user entries in real-time
 *  and identifies potential errors or inconsistencies in financial data.
 *
 * - aiErrorWatch - A function that processes user input and returns potential errors or inconsistencies.
 * - AiErrorWatchInput - The input type for the aiErrorWatch function.
 * - AiErrorWatchOutput - The return type for the aiErrorWatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiErrorWatchInputSchema = z.object({
  revenue: z.string().describe('The revenue entered by the user.'),
  expenses: z.string().describe('The expenses entered by the user.'),
  inventory: z.string().describe('The inventory data entered by the user.'),
});
export type AiErrorWatchInput = z.infer<typeof AiErrorWatchInputSchema>;

const AiErrorWatchOutputSchema = z.object({
  errors: z.array(
    z.string().describe('A list of potential errors or inconsistencies identified by the AI.')
  ).describe('List of identified errors'),
});
export type AiErrorWatchOutput = z.infer<typeof AiErrorWatchOutputSchema>;

export async function aiErrorWatch(input: AiErrorWatchInput): Promise<AiErrorWatchOutput> {
  return aiErrorWatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiErrorWatchPrompt',
  input: {schema: AiErrorWatchInputSchema},
  output: {schema: AiErrorWatchOutputSchema},
  prompt: `You are an AI assistant that helps users identify potential errors or inconsistencies in their financial data entries.

  Review the following data entries and identify any potential errors, inconsistencies, or missing information.
  Provide a list of errors or questions to help the user correct their entries. Be specific and clear in your feedback.

  Revenue: {{{revenue}}}
  Expenses: {{{expenses}}}
  Inventory: {{{inventory}}}

  Output a JSON array of strings representing the errors found. If no errors are found, return an empty array.
  `,
});

const aiErrorWatchFlow = ai.defineFlow(
  {
    name: 'aiErrorWatchFlow',
    inputSchema: AiErrorWatchInputSchema,
    outputSchema: AiErrorWatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
