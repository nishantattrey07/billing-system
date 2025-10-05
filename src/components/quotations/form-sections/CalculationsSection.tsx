'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/lib/utils/quotation-calculations'
import type { useQuotationForm } from '../hooks/useQuotationForm'

interface CalculationsSectionProps {
  formState: ReturnType<typeof useQuotationForm>
  safetyMode: boolean
}

export function CalculationsSection({ formState, safetyMode }: CalculationsSectionProps) {
  const isSameState = formState.companyState === formState.customerState
  const showGST = formState.customerState && formState.companyState

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Calculations</h2>
        {safetyMode && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="check-calculations"
              checked={formState.safetyChecks.calculations}
              onCheckedChange={() => formState.toggleSafetyCheck('calculations')}
            />
            <Label htmlFor="check-calculations" className="text-sm font-medium cursor-pointer">
              Verified
            </Label>
          </div>
        )}
      </div>

      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Subtotal</Label>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(formState.subtotal)}
          </div>
        </div>

        {/* Freight Charges */}
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="freight-charges" className="text-sm font-medium text-gray-700">
            Freight Charges
          </Label>
          <div className="w-40">
            <Input
              id="freight-charges"
              type="text"
              inputMode="decimal"
              value={formState.freightCharges}
              onChange={(e) => {
                const value = e.target.value
                const parsed = parseFloat(value)
                if (!isNaN(parsed) || value === '' || value === '-') {
                  formState.updateField('freightCharges', parsed || 0)
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="text-sm text-right"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="border-t border-gray-300 my-2" />

        {/* GST Section */}
        {showGST ? (
          <>
            {isSameState ? (
              <>
                {/* SGST */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">SGST (9%)</Label>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(formState.sgst)}
                  </div>
                </div>

                {/* CGST */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">CGST (9%)</Label>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(formState.cgst)}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* IGST */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">IGST (18%)</Label>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(formState.igst)}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            Set customer state to calculate GST
          </div>
        )}

        <div className="border-t border-gray-300 my-2" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-gray-900">Total</Label>
          <div className="text-base font-bold text-gray-900">
            {formatCurrency(formState.total)}
          </div>
        </div>

        {/* Total in Words */}
        {formState.total > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <Label className="text-xs text-gray-500">Amount in Words</Label>
            <p className="text-sm font-medium text-gray-700 mt-1 italic">
              {formState.totalInWords}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
