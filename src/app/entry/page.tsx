'use client'
import { PageHeader } from '@/components/page-header'
import { EntryForm } from '@/components/entry/entry-form'

export default function EntryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Entry"
        description="Add your revenues, expenses, and inventory. The AI assistant will help you spot any issues."
      />
      <EntryForm />
    </div>
  )
}
