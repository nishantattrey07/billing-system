'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { companySchema, type CompanyInput } from '@/lib/validation/schemas/company.schema'
import { useCreateCompany, useUpdateCompany } from '@/lib/hooks/useCompanies'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Company } from '@/generated/prisma'

interface CompanyFormProps {
  company?: Company
  mode?: 'create' | 'edit'
}

// Transform Company (with null) to CompanyInput (with undefined/empty string)
function transformCompanyToFormData(company?: Company): Partial<CompanyInput> {
  if (!company) {
    return {
      name: '',
      gstin: '',
      pan: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
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

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: transformCompanyToFormData(company),
  })

  const isLoading = createCompany.isPending || updateCompany.isPending

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
  }, [isDirty, router])

  const onSubmit = async (data: CompanyInput) => {
    try {
      if (mode === 'create') {
        await createCompany.mutateAsync(data)
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
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('form.basicInfo') || 'Basic Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">
                {t('name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name && 'border-destructive'}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
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
          <CardTitle className="text-lg">{t('form.contactInfo') || 'Contact Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input id="address" {...register('address')} />
              {errors.address && (
                <p className="text-xs text-destructive mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">{t('city')}</Label>
              <Input id="city" {...register('city')} />
              {errors.city && (
                <p className="text-xs text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">{t('state')}</Label>
              <Input id="state" {...register('state')} />
              {errors.state && (
                <p className="text-xs text-destructive mt-1">{errors.state.message}</p>
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

            <div className="sm:col-span-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('form.bankInfo') || 'Bank Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bankName">{t('bankName')}</Label>
              <Input id="bankName" {...register('bankName')} />
              {errors.bankName && (
                <p className="text-xs text-destructive mt-1">{errors.bankName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="accountNumber">{t('accountNumber')}</Label>
              <Input id="accountNumber" {...register('accountNumber')} />
              {errors.accountNumber && (
                <p className="text-xs text-destructive mt-1">{errors.accountNumber.message}</p>
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

            <div>
              <Label htmlFor="branch">{t('branch')}</Label>
              <Input id="branch" {...register('branch')} />
              {errors.branch && (
                <p className="text-xs text-destructive mt-1">{errors.branch.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tCommon('save')}
        </Button>
        <Button
          type="button"
          variant="outline"
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
      <p className="text-xs text-muted-foreground">
        Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Cmd/Ctrl + S</kbd> to save, <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> to cancel
      </p>
    </form>
  )
}
