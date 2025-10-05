'use client'

import { useState } from 'react'
import { QuotationForm } from './QuotationForm'
import { QuotationPreview } from './QuotationPreview'
import { QuotationTopBar } from './QuotationTopBar'
import { QuotationActionBar } from './QuotationActionBar'
import { useQuotationForm } from './hooks/useQuotationForm'

export function QuotationCreationLayout() {
  const [safetyMode, setSafetyMode] = useState(false)
  const formState = useQuotationForm()

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
      />
    </div>
  )
}
