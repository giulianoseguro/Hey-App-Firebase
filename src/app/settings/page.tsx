
import { PageHeader } from '@/components/page-header'
import { ResetDataCard } from '@/components/settings/reset-data-card'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your application settings and data."
      />
      <div className="space-y-6">
         <ResetDataCard />
      </div>
    </div>
  )
}
