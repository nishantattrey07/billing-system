'use client'

import { useState } from 'react'
import { QuotationForm } from './QuotationForm'
import { QuotationPreview } from './QuotationPreview'
import { QuotationTopBar } from './QuotationTopBar'
import { QuotationActionBar } from './QuotationActionBar'
import { useQuotationForm } from './hooks/useQuotationForm'
import type { QuotationItem } from './hooks/useQuotationForm'

// Props from server
interface QuotationCreationLayoutProps {
  initialCompanies: Array<{
    id: string
    name: string
    state: string | null
    gstin: string
    defaultTerms: string | null
  }>
  initialCustomers: Array<{
    id: string
    name: string
    gstin: string | null
    address: string | null
    city: string | null
    state: string | null
  }>
  selectedCompany: {
    id: string
    name: string
    gstin: string
    address: string | null
    phone: string | null
    state: string | null
    defaultTerms: string | null
  } | null
  existingQuotation?: {
    id: string
    number: string
    date: Date
    subject: string
    financialYear: string
    companyId: string
    companyName: string
    companyGstin: string
    companyAddress: string | null
    companyPhone: string | null
    companyState: string | null
    customerId: string
    customerName: string
    customerGstin: string | null
    customerAddress: string | null
    customerCity: string | null
    customerState: string | null
    items: QuotationItem[]
    freightCharges: number
    termsAndConditions: string
    status: string
  }
}

export function QuotationCreationLayout({
  initialCustomers,
  selectedCompany,
  existingQuotation,
}: QuotationCreationLayoutProps) {
  const [safetyMode, setSafetyMode] = useState(false)

  // Pass server data to form hook
  const formState = useQuotationForm({
    initialCompany: selectedCompany,
    initialCustomers,
    existingQuotation,
  })

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <QuotationTopBar
        safetyMode={safetyMode}
        onSafetyModeToggle={setSafetyMode}
        quotationNumber={formState.number}
        isDraft={formState.isDraft}
        lastSaved={formState.lastSaved}
      />

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className="w-[40%] bg-white border-r border-gray-200 overflow-y-auto">
          <QuotationForm
            formState={formState}
            safetyMode={safetyMode}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="w-[60%] bg-gray-50 overflow-y-auto p-8">
          <QuotationPreview formState={formState} />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <QuotationActionBar
        formState={formState}
        safetyMode={safetyMode}
        quotationId={existingQuotation?.id}
      />
    </div>
  )
}
