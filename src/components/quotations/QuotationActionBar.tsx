'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Download, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import type { useQuotationForm } from './hooks/useQuotationForm'

interface QuotationActionBarProps {
  formState: ReturnType<typeof useQuotationForm>
  safetyMode: boolean
}

export function QuotationActionBar({ formState, safetyMode }: QuotationActionBarProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Check if all safety checks are completed
  const allSafetyChecksComplete = safetyMode
    ? Object.values(formState.safetyChecks).every((check) => check === true)
    : true

  // Count completed safety checks
  const completedChecks = Object.values(formState.safetyChecks).filter(
    (check) => check === true
  ).length
  const totalChecks = Object.keys(formState.safetyChecks).length

  const handleSaveDraft = async () => {
    setIsSaving(true)

    try {
      const draftData = {
        companyId: formState.companyId,
        number: formState.number,
        date: formState.date,
        subject: formState.subject,
        financialYear: formState.financialYear,
        customerId: formState.customerId,
        customerName: formState.customerName,
        customerGstin: formState.customerGstin,
        customerAddress: formState.customerAddress,
        customerCity: formState.customerCity,
        customerState: formState.customerState,
        items: formState.items,
        freightCharges: formState.freightCharges,
        terms: formState.terms,
        validUntil: formState.validUntil,
      }

      const response = await fetch('/api/quotations/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save draft')
      }

      await response.json()

      // Update lastSaved timestamp
      formState.updateField('lastSaved', new Date())

      const { toast } = await import('sonner')
      toast.success('Draft saved successfully!')
    } catch (error) {
      console.error('Save draft error:', error)
      const { toast } = await import('sonner')
      toast.error(error instanceof Error ? error.message : 'Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!allSafetyChecksComplete) return

    setIsGeneratingPDF(true)

    try {
      // Prepare quotation data for server
      const quotationData = {
        companyName: formState.companyName,
        companyGstin: formState.companyGstin,
        companyAddress: formState.companyAddress,
        companyPhone: formState.companyPhone,
        companyState: formState.companyState,
        number: formState.number,
        date: formState.date,
        validUntil: formState.validUntil,
        financialYear: formState.financialYear,
        subject: formState.subject,
        customerName: formState.customerName,
        customerGstin: formState.customerGstin,
        customerAddress: formState.customerAddress,
        customerCity: formState.customerCity,
        customerState: formState.customerState,
        items: formState.items,
        freightCharges: formState.freightCharges,
        subtotal: formState.subtotal,
        sgst: formState.sgst,
        cgst: formState.cgst,
        igst: formState.igst,
        total: formState.total,
        totalInWords: formState.totalInWords,
        terms: formState.terms,
      }

      // Call server API to generate PDF
      const response = await fetch('/api/quotations/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to generate PDF'
        try {
          const error = await response.json()
          errorMessage = error.error || error.details || errorMessage
        } catch {
          // If response is not JSON, try to get text
          const text = await response.text()
          errorMessage = text || `Server error (${response.status})`
        }
        throw new Error(errorMessage)
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Quotation-${formState.number || 'draft'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Success notification (using sonner)
      const { toast } = await import('sonner')
      toast.success('PDF generated successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      const { toast } = await import('sonner')
      toast.error(error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleEmail = () => {
    // TODO: Implement email functionality
    console.log('Email clicked')
  }

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Safety Check Progress */}
        <div className="flex items-center gap-3">
          {safetyMode && (
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-5 h-5 ${
                  allSafetyChecksComplete ? 'text-green-600' : 'text-gray-400'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                Safety Checks: {completedChecks}/{totalChecks}
              </span>
              {allSafetyChecksComplete && (
                <span className="text-xs text-green-600 font-medium">All verified ✓</span>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Save Draft */}
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>

          {/* Email */}
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>

          {/* Download PDF */}
          <Button
            onClick={handleDownloadPDF}
            disabled={!allSafetyChecksComplete || isGeneratingPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Safety Mode Warning */}
      {safetyMode && !allSafetyChecksComplete && (
        <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Safety Mode Active:</span> Please verify all sections
            before downloading PDF
          </p>
        </div>
      )}
    </div>
  )
}
