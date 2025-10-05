'use client'

import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { useQuotationForm } from '../hooks/useQuotationForm'

interface QuotationDetailsSectionProps {
  formState: ReturnType<typeof useQuotationForm>
  safetyMode: boolean
}

export function QuotationDetailsSection({ formState, safetyMode }: QuotationDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Quotation Details</h2>
        {safetyMode && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="check-quotation-details"
              checked={formState.safetyChecks.quotationDetails}
              onCheckedChange={() => formState.toggleSafetyCheck('quotationDetails')}
            />
            <Label
              htmlFor="check-quotation-details"
              className="text-sm font-medium cursor-pointer"
            >
              Verified
            </Label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Quotation Number */}
        <div className="space-y-2">
          <Label htmlFor="quotation-number">Quotation Number *</Label>
          <Input
            id="quotation-number"
            value={formState.number}
            onChange={(e) => formState.updateField('number', e.target.value)}
            placeholder="Q.no: 001/2024-25"
          />
          <p className="text-xs text-gray-500">Format: Q.no: XXX/YYYY-YY</p>
        </div>

        {/* Financial Year */}
        <div className="space-y-2">
          <Label htmlFor="financial-year">Financial Year</Label>
          <Input
            id="financial-year"
            value={formState.financialYear}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Quotation Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formState.date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formState.date ? format(formState.date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formState.date}
                onSelect={(date) => date && formState.updateField('date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Valid Until */}
        <div className="space-y-2">
          <Label>Valid Until</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formState.validUntil && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formState.validUntil ? format(formState.validUntil, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formState.validUntil}
                onSelect={(date) => formState.updateField('validUntil', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Subject */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={formState.subject}
            onChange={(e) => formState.updateField('subject', e.target.value)}
            placeholder="e.g., Quotation for Fire Safety Equipment"
          />
        </div>
      </div>
    </div>
  )
}
