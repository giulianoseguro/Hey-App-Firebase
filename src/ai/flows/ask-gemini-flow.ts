'use server';
/**
 * @fileOverview A Genkit flow for answering questions about pizzeria data.
 *
 * - askGemini - A function that takes a user query and business data to generate an answer.
 * - AskGeminiInput - The input type for the askGemini function.
 * - AskGeminiOutput - The return type for the askGemini function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// We pass data as JSON strings to avoid complex object serialization issues.
const AskGeminiInputSchema = z.object({
  query: z.string().describe("The user's question about their business data."),
  transactions: z.string().describe('JSON string of all financial transactions.'),
  inventory: z.string().describe('JSON string of all inventory items.'),
  menuItems: z.string().describe('JSON string of all menu items.'),
  payroll: z.string().describe('JSON string of all payroll entries.'),
});
export type AskGeminiInput = z.infer<typeof AskGeminiInputSchema>;

const AskGeminiOutputSchema = z.object({
  answer: z.string().describe("The AI-generated answer to the user's query."),
});
export type AskGeminiOutput = z.infer<typeof AskGeminiOutputSchema>;

export async function askGemini(input: AskGeminiInput): Promise<AskGeminiOutput> {
  return askGeminiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askGeminiPrompt',
  input: {schema: AskGeminiInputSchema},
  output: {schema: AskGeminiOutputSchema},
  prompt: `You are an expert financial analyst for a Brazilian pizzeria. Your goal is to answer questions based on the data provided. Be concise and helpful. Use the provided data to answer the user's query.

  User Query: {{{query}}}

  Here is the data for the pizzeria:

  Transactions (JSON):
  \`\`\`json
  {{{transactions}}}
  \`\`\`

  Inventory (JSON):
  \`\`\`json
  {{{inventory}}}
  \`\`\`

  Menu Items (JSON):
  \`\`\`json
  {{{menuItems}}}
  \`\`\`

  Payroll (JSON):
  \`\`\`json
  {{{payroll}}}
  \`\`\`

  Analyze the data and provide a clear, data-driven answer to the user's query. If the data is insufficient to answer, state that and explain what information is missing.
  `,
});

const askGeminiFlow = ai.defineFlow(
  {
    name: 'askGeminiFlow',
    inputSchema: AskGeminiInputSchema,
    outputSchema: AskGeminiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
