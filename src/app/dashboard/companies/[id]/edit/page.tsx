'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { useCompany } from '@/lib/hooks/useCompanies'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('company')
  const tCommon = useTranslations('common')

  const { data: company, isLoading, error } = useCompany(id)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{tCommon('noData')}</p>
        <Link href="/companies">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
      </div>
    )
  }

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
          <h1 className="text-2xl font-semibold tracking-tight">{t('form.edit')}</h1>
          <p className="text-sm text-muted-foreground">{company.name}</p>
        </div>
      </div>

      {/* Form */}
      <CompanyForm mode="edit" company={company} />
    </div>
  )
}
