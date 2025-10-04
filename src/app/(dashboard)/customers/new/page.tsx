'use client'

import { useTranslations } from 'next-intl'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewCustomerPage() {
  const t = useTranslations('customer')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('form.create')}</h1>
          <p className="text-sm text-muted-foreground">{t('addNew')}</p>
        </div>
      </div>

      {/* Form */}
      <CustomerForm mode="create" />
    </div>
  )
}
