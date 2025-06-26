import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface KPICardProps {
  title: string
  value: string
  icon: LucideIcon
  href?: string
}

export function KPICard({ title, value, icon: Icon, href }: KPICardProps) {
  const cardContent = (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
