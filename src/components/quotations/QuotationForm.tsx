'use client'

import { QuotationDetailsSection } from './form-sections/QuotationDetailsSection'
import { CustomerSection } from './form-sections/CustomerSection'
import { ItemsSection } from './form-sections/ItemsSection'
import { CalculationsSection } from './form-sections/CalculationsSection'
import { TermsSection } from './form-sections/TermsSection'
import type { QuotationFormState } from './hooks/useQuotationForm'

interface QuotationFormProps {
  formState: ReturnType<typeof import('./hooks/useQuotationForm').useQuotationForm>
  safetyMode: boolean
}

export function QuotationForm({ formState, safetyMode }: QuotationFormProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Quotation Details */}
      <QuotationDetailsSection
        formState={formState}
        safetyMode={safetyMode}
      />

      {/* Customer Information */}
      <CustomerSection
        formState={formState}
        safetyMode={safetyMode}
      />

      {/* Items */}
      <ItemsSection
        formState={formState}
        safetyMode={safetyMode}
      />

      {/* Calculations */}
      <CalculationsSection
        formState={formState}
        safetyMode={safetyMode}
      />

      {/* Terms & Conditions */}
      <TermsSection
        formState={formState}
        safetyMode={safetyMode}
      />
    </div>
  )
}
