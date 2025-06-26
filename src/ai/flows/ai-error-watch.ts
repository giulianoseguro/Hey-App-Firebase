'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI assistant that watches user entries in real-time
 *  and identifies potential errors or inconsistencies in financial data.
 *
 * - aiErrorWatch - Uma função que processa a entrada do usuário e retorna possíveis erros ou inconsistências.
 * - AiErrorWatchInput - O tipo de entrada para a função aiErrorWatch.
 * - AiErrorWatchOutput - O tipo de retorno para a função aiErrorWatch.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiErrorWatchInputSchema = z.object({
  revenue: z.string().describe('A receita inserida pelo usuário.'),
  expenses: z.string().describe('As despesas inseridas pelo usuário.'),
  inventory: z.string().describe('Os dados de estoque inseridos pelo usuário.'),
});
export type AiErrorWatchInput = z.infer<typeof AiErrorWatchInputSchema>;

const AiErrorWatchOutputSchema = z.object({
  errors: z.array(
    z.string().describe('Uma lista de possíveis erros ou inconsistências identificados pela IA.')
  ).describe('Lista de erros identificados'),
});
export type AiErrorWatchOutput = z.infer<typeof AiErrorWatchOutputSchema>;

export async function aiErrorWatch(input: AiErrorWatchInput): Promise<AiErrorWatchOutput> {
  return aiErrorWatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiErrorWatchPrompt',
  input: {schema: AiErrorWatchInputSchema},
  output: {schema: AiErrorWatchOutputSchema},
  prompt: `Você é um assistente de IA que ajuda os usuários a identificar possíveis erros ou inconsistências em seus lançamentos de dados financeiros.

  Revise os seguintes lançamentos de dados e identifique quaisquer erros, inconsistências ou informações ausentes.
  Forneça uma lista de erros ou perguntas para ajudar o usuário a corrigir seus lançamentos. Seja específico e claro em seu feedback.

  Receita: {{{revenue}}}
  Despesas: {{{expenses}}}
  Estoque: {{{inventory}}}

  A saída deve ser um array JSON de strings representando os erros encontrados. Se nenhum erro for encontrado, retorne um array vazio.
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
