'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { customerSchema, type CustomerInput } from '@/lib/validation/schemas/customer.schema'
import { useCreateCustomer, useUpdateCustomer } from '@/lib/hooks/useCustomers'
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
import { Customer } from '@/generated/prisma'

interface CustomerFormProps {
  customer?: Customer
  mode?: 'create' | 'edit'
}

// Transform Customer (with null) to CustomerInput (with undefined/empty string)
function transformCustomerToFormData(customer?: Customer, smartDefaults?: { city?: string; state?: string; pincode?: string }): Partial<CustomerInput> {
  if (!customer) {
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
      contactPerson: '',
    }
  }

  return {
    name: customer.name,
    gstin: customer.gstin ?? '',
    pan: customer.pan ?? '',
    address: customer.address ?? '',
    city: customer.city ?? '',
    state: customer.state ?? '',
    pincode: customer.pincode ?? '',
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    contactPerson: customer.contactPerson ?? '',
  }
}

export function CustomerForm({ customer, mode = 'create' }: CustomerFormProps) {
  const router = useRouter()
  const t = useTranslations('customer')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')
  const tValidation = useTranslations('validation')

  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const { getDefaults } = useSmartDefaults()

  const [showDraftDialog, setShowDraftDialog] = useState(false)

  // Get smart defaults for new customers
  const smartDefaults = mode === 'create' && !customer ? getDefaults() : undefined

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: transformCustomerToFormData(customer, smartDefaults),
  })

  const isLoading = createCustomer.isPending || updateCustomer.isPending

  // Auto-save draft (only for create mode)
  const draftKey = `customer-draft-${mode === 'edit' ? customer?.id : 'new'}`
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

  // Calculate form progress (required field: name only)
  const name = watch('name')
  const formProgress = React.useMemo(() => {
    return name ? 100 : 0
  }, [name])

  // Check for draft on mount (only for create mode)
  useEffect(() => {
    if (mode === 'create' && !customer) {
      const draft = getDraft<CustomerInput>()
      if (draft) {
        setShowDraftDialog(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRestoreDraft = () => {
    const draft = getDraft<CustomerInput>()
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
  const onSubmit = useCallback(async (data: CustomerInput) => {
    try {
      if (mode === 'create') {
        await createCustomer.mutateAsync(data)
        clearDraft() // Clear draft on successful creation
        toast.success(tMessages('createSuccess'))
        router.push('/customers')
      } else if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, data })
        toast.success(tMessages('updateSuccess'))
        router.push('/customers')
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
          toast.error(tValidation('duplicateError'))
        } else {
          toast.error(tMessages('createError'))
        }
      } else {
        toast.error(tMessages('createError'))
      }
    }
  }, [mode, customer, createCustomer, updateCustomer, clearDraft, tMessages, tValidation, router])

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
                placeholder="Enter customer name"
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
              <Label htmlFor="contactPerson" className="text-sm font-semibold text-foreground">{t('contactPerson')}</Label>
              <Input id="contactPerson" {...register('contactPerson')} placeholder="Enter contact person name" />
              {errors.contactPerson && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.contactPerson.message}</p>
              )}
            </div>

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

            <div className="space-y-2.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">{t('phone')}</Label>
              <Input id="phone" {...register('phone')} placeholder="9876543210" />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.phone.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">{t('email')}</Label>
              <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
              {errors.email && (
                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.email.message}</p>
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
        entityType="customer"
      />
    </form>
  )
}
