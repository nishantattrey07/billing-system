'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Save, Download, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import type { useQuotationForm } from './hooks/useQuotationForm'

interface QuotationActionBarProps {
  formState: ReturnType<typeof useQuotationForm>
  safetyMode: boolean
  quotationId?: string
}

export function QuotationActionBar({ formState, safetyMode, quotationId }: QuotationActionBarProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const savedQuotationIdRef = useRef<string | null>(quotationId || null)
  const router = useRouter()

  // Check if all safety checks are completed
  const allSafetyChecksComplete = safetyMode
    ? Object.values(formState.safetyChecks).every((check) => check === true)
    : true

  // Count completed safety checks
  const completedChecks = Object.values(formState.safetyChecks).filter(
    (check) => check === true
  ).length
  const totalChecks = Object.keys(formState.safetyChecks).length

  const handleSave = async (silent = false): Promise<string | null> => {
    setIsSaving(true)

    try {
      const quotationData = {
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

      const currentQuotationId = savedQuotationIdRef.current
      const response = await fetch(
        currentQuotationId ? `/api/quotations/${currentQuotationId}` : '/api/quotations/draft',
        {
          method: currentQuotationId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotationData),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        // Handle both old and new error response formats
        const errorMessage = error.message || error.error || `Failed to ${currentQuotationId ? 'update' : 'save'} quotation`
        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Extract quotation ID from response (handles both { success, data } and { success, quotationId } formats)
      const newQuotationId = result.data?.quotationId || result.quotationId || currentQuotationId

      // Store the quotation ID for future saves
      if (newQuotationId) {
        savedQuotationIdRef.current = newQuotationId
      }

      // Update lastSaved timestamp
      formState.updateField('lastSaved', new Date())

      if (!silent) {
        const { toast } = await import('sonner')
        toast.success(`Quotation ${currentQuotationId ? 'updated' : 'saved'} successfully!`)
      }

      return newQuotationId
    } catch (error) {
      console.error('Save error:', error)
      const { toast } = await import('sonner')
      toast.error(error instanceof Error ? error.message : `Failed to ${savedQuotationIdRef.current ? 'update' : 'save'} quotation`)
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!allSafetyChecksComplete) return

    setIsGeneratingPDF(true)

    try {
      // Step 1: Auto-save quotation before generating PDF
      const { toast } = await import('sonner')

      // Save quotation (creates or updates in database with audit log)
      const savedId = await handleSave(true) // silent = true to avoid double toast

      if (!savedId) {
        throw new Error('Failed to save quotation before generating PDF')
      }

      // Step 2: Generate PDF using the saved quotation ID
      const response = await fetch(`/api/quotations/pdf?id=${savedId}`)

      if (!response.ok) {
        let errorMessage = 'Failed to generate PDF'
        try {
          const error = await response.json()
          errorMessage = error.error || error.details || error.message || errorMessage
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

      // Success notification
      toast.success('Quotation saved and PDF downloaded successfully!')

      // If this was a new quotation, redirect to edit page with the new ID
      if (!quotationId && savedId) {
        setTimeout(() => {
          router.push(`/dashboard/quotations/${savedId}/edit`)
        }, 1000)
      }
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
          {/* Save/Update */}
          <Button variant="outline" onClick={() => handleSave()} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {savedQuotationIdRef.current ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {savedQuotationIdRef.current || quotationId ? 'Update Quotation' : 'Save Draft'}
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
                {savedQuotationIdRef.current ? 'Updating & Generating...' : 'Saving & Generating...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {savedQuotationIdRef.current || quotationId ? 'Download PDF' : 'Save & Download PDF'}
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
