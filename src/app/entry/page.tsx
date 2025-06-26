'use client'
import { PageHeader } from '@/components/page-header'
import { EntryForm } from '@/components/entry/entry-form'

export default function EntryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Entrada de Dados"
        description="Adicione suas receitas, despesas e estoque. O assistente de IA ajudará a identificar quaisquer problemas."
      />
      <EntryForm />
    </div>
  )
}
