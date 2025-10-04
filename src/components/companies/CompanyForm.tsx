'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { companySchema, type CompanyInput } from '@/lib/validation/schemas/company.schema'
import { useCreateCompany, useUpdateCompany } from '@/lib/hooks/useCompanies'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { useSmartDefaults, useAutoSaveDefaults } from '@/lib/hooks/useSmartDefaults'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DraftRestoreDialog } from '@/components/ui/draft-restore-dialog'
import { KeyboardHint } from '@/components/ui/keyboard-hint'
import { FormProgress } from '@/components/ui/form-progress'
import { Company } from '@/generated/prisma'

interface CompanyFormProps {
  company?: Company
  mode?: 'create' | 'edit'
}

// Transform Company (with null) to CompanyInput (with undefined/empty string)
function transformCompanyToFormData(company?: Company, smartDefaults?: { city?: string; state?: string; pincode?: string }): Partial<CompanyInput> {
  if (!company) {
    return {
      name: '',
      gstin: '',
      pan: '',
      address: '',
      city: smartDefaults?.city ?? '',
      state: smartDefaults?.state ?? '',
      pincode: smartDefaults?.pincode ?? '',
      phone: '',
      email: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branch: '',
    }
  }

  return {
    name: company.name,
    gstin: company.gstin,
    pan: company.pan ?? '',
    address: company.address ?? '',
    city: company.city ?? '',
    state: company.state ?? '',
    pincode: company.pincode ?? '',
    phone: company.phone ?? '',
    email: company.email ?? '',
    bankName: company.bankName ?? '',
    accountNumber: company.accountNumber ?? '',
    ifscCode: company.ifscCode ?? '',
    branch: company.branch ?? '',
  }
}

export function CompanyForm({ company, mode = 'create' }: CompanyFormProps) {
  const router = useRouter()
  const t = useTranslations('company')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')
  const tValidation = useTranslations('validation')

  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const { getDefaults } = useSmartDefaults()

  const [showDraftDialog, setShowDraftDialog] = useState(false)

  // Get smart defaults for new companies
  const smartDefaults = mode === 'create' && !company ? getDefaults() : undefined

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: transformCompanyToFormData(company, smartDefaults),
  })

  const isLoading = createCompany.isPending || updateCompany.isPending

  // Auto-save draft (only for create mode)
  const draftKey = `company-draft-${mode === 'edit' ? company?.id : 'new'}`
  const formData = watch()
  const { clearDraft, getDraft } = useAutoSave({
    key: draftKey,
    data: formData,
    enabled: mode === 'create' && isDirty,
  })

  // Auto-save smart defaults (city, state, pincode)
  const city = watch('city')
  const state = watch('state')
  const pincode = watch('pincode')
  useAutoSaveDefaults({ city, state, pincode })

  // Calculate form progress (required fields: name, gstin)
  const name = watch('name')
  const gstin = watch('gstin')
  const formProgress = React.useMemo(() => {
    const requiredFields = { name, gstin }
    const filledFields = Object.values(requiredFields).filter(Boolean).length
    return (filledFields / Object.keys(requiredFields).length) * 100
  }, [name, gstin])

  // Check for draft on mount (only for create mode)
  useEffect(() => {
    if (mode === 'create' && !company) {
      const draft = getDraft<CompanyInput>()
      if (draft) {
        setShowDraftDialog(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRestoreDraft = () => {
    const draft = getDraft<CompanyInput>()
    if (draft) {
      reset(draft)
    }
    setShowDraftDialog(false)
  }

  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftDialog(false)
  }

  // Form submit handler
  const onSubmit = useCallback(async (data: CompanyInput) => {
    try {
      if (mode === 'create') {
        await createCompany.mutateAsync(data)
        clearDraft() // Clear draft on successful creation
        toast.success(tMessages('createSuccess'))
        router.push('/companies')
      } else if (company) {
        await updateCompany.mutateAsync({ id: company.id, data })
        toast.success(tMessages('updateSuccess'))
        router.push('/companies')
      }
    } catch (error) {
      // Handle validation errors
      if (error && typeof error === 'object' && 'error' in error) {
        const apiError = error as { error: string; fields?: Array<{ path: string; code: string }> }

        if (apiError.error === 'validation_error' && apiError.fields) {
          apiError.fields.forEach((field) => {
            toast.error(`${field.path}: ${tValidation(field.code)}`)
          })
        } else if (apiError.error === 'duplicate_error') {
          toast.error(tValidation('duplicateGSTIN'))
        } else {
          toast.error(tMessages('createError'))
        }
      } else {
        toast.error(tMessages('createError'))
      }
    }
  }, [mode, company, createCompany, updateCompany, clearDraft, tMessages, tValidation, router])

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit(onSubmit)()
      }

      // Esc to cancel
      if (e.key === 'Escape') {
        if (isDirty) {
          if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
            router.back()
          }
        } else {
          router.back()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDirty, router, handleSubmit, onSubmit])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader className="relative">
          {mode === 'create' && (
            <div className="absolute top-0 right-6">
              <FormProgress progress={formProgress} />
            </div>
          )}
          <CardTitle>{t('form.basicInfo') || 'Basic Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2.5">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                {t('name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter company name"
                className={errors.name && 'border-destructive'}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.name.message}</p>
              )}
            </div>

            <FormInput
              id="gstin"
              label={t('gstin')}
              mask="gstin"
              required
              showStateHint
              value={watch('gstin')}
              onChange={(value) => setValue('gstin', value, { shouldValidate: true })}
              error={errors.gstin?.message}
              placeholder="22AAAAA0000A1Z5"
            />

            <FormInput
              id="pan"
              label={t('pan')}
              mask="pan"
              value={watch('pan')}
              onChange={(value) => setValue('pan', value, { shouldValidate: true })}
              error={errors.pan?.message}
              placeholder="ABCDE1234F"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.contactInfo') || 'Contact Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2.5">
              <Label htmlFor="address" className="text-sm font-semibold text-foreground">{t('address')}</Label>
              <Input id="address" {...register('address')} placeholder="Enter address" />
              {errors.address && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="city" className="text-sm font-semibold text-foreground">{t('city')}</Label>
              <Input id="city" {...register('city')} placeholder="Enter city" />
              {errors.city && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="state" className="text-sm font-semibold text-foreground">{t('state')}</Label>
              <Input id="state" {...register('state')} placeholder="Enter state" />
              {errors.state && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.state.message}</p>
              )}
            </div>

            <FormInput
              id="pincode"
              label={t('pincode')}
              mask="pincode"
              value={watch('pincode')}
              onChange={(value) => setValue('pincode', value, { shouldValidate: true })}
              error={errors.pincode?.message}
              placeholder="123456"
            />

            <FormInput
              id="phone"
              label={t('phone')}
              mask="phone"
              value={watch('phone')}
              onChange={(value) => setValue('phone', value, { shouldValidate: true })}
              error={errors.phone?.message}
              placeholder="98765-43210"
            />

            <div className="sm:col-span-2 space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">{t('email')}</Label>
              <Input id="email" type="email" {...register('email')} placeholder="email@company.com" />
              {errors.email && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.bankInfo') || 'Bank Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label htmlFor="bankName" className="text-sm font-semibold text-foreground">{t('bankName')}</Label>
              <Input id="bankName" {...register('bankName')} placeholder="Enter bank name" />
              {errors.bankName && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.bankName.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="accountNumber" className="text-sm font-semibold text-foreground">{t('accountNumber')}</Label>
              <Input id="accountNumber" {...register('accountNumber')} placeholder="Enter account number" />
              {errors.accountNumber && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.accountNumber.message}</p>
              )}
            </div>

            <FormInput
              id="ifscCode"
              label={t('ifscCode')}
              mask="ifsc"
              value={watch('ifscCode')}
              onChange={(value) => setValue('ifscCode', value, { shouldValidate: true })}
              error={errors.ifscCode?.message}
              placeholder="SBIN0001234"
            />

            <div className="space-y-2.5">
              <Label htmlFor="branch" className="text-sm font-semibold text-foreground">{t('branch')}</Label>
              <Input id="branch" {...register('branch')} placeholder="Enter branch name" />
              {errors.branch && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.branch.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="h-11 px-8">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tCommon('save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-8"
          onClick={() => {
            if (isDirty) {
              if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                router.back()
              }
            } else {
              router.back()
            }
          }}
        >
          {tCommon('cancel')}
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <KeyboardHint />

      {/* Draft Restore Dialog */}
      <DraftRestoreDialog
        open={showDraftDialog}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
        entityType="company"
      />
    </form>
  )
}
