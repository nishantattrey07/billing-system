'use client'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import type { useQuotationForm } from '../hooks/useQuotationForm'

interface TermsSectionProps {
  formState: ReturnType<typeof useQuotationForm>
  safetyMode: boolean
}

export function TermsSection({ formState, safetyMode }: TermsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions</h2>
        {safetyMode && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="check-terms"
              checked={formState.safetyChecks.terms}
              onCheckedChange={() => formState.toggleSafetyCheck('terms')}
            />
            <Label htmlFor="check-terms" className="text-sm font-medium cursor-pointer">
              Verified
            </Label>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Textarea
          id="terms"
          value={formState.terms}
          onChange={(e) => formState.updateField('terms', e.target.value)}
          placeholder="Enter terms and conditions for this quotation..."
          rows={8}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          These terms will be displayed at the bottom of the quotation
        </p>
      </div>
    </div>
  )
}
