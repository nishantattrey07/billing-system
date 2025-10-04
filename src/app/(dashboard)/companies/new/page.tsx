'use client'

import { useTranslations } from 'next-intl'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewCompanyPage() {
  const t = useTranslations('company')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/companies">
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
      <CompanyForm mode="create" />
    </div>
  )
}
