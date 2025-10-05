'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/quotation-calculations'
import type { useQuotationForm } from '../hooks/useQuotationForm'

interface ItemsSectionProps {
  formState: ReturnType<typeof useQuotationForm>
  safetyMode: boolean
}

export function ItemsSection({ formState, safetyMode }: ItemsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        {safetyMode && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="check-items"
              checked={formState.safetyChecks.items}
              onCheckedChange={() => formState.toggleSafetyCheck('items')}
            />
            <Label htmlFor="check-items" className="text-sm font-medium cursor-pointer">
              Verified
            </Label>
          </div>
        )}
      </div>

      {formState.items.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No items added yet</p>
          <Button onClick={formState.addItem} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {formState.items.map((item, index) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formState.removeItem(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Item Fields */}
              <div className="grid grid-cols-2 gap-3">
                {/* Name */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Item Name *</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => formState.updateItem(item.id, { name: e.target.value })}
                    placeholder="Enter item name"
                    className="text-sm"
                  />
                </div>

                {/* Remarks */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Remarks</Label>
                  <Textarea
                    value={item.remarks || ''}
                    onChange={(e) => formState.updateItem(item.id, { remarks: e.target.value })}
                    placeholder="Additional details (optional)"
                    rows={2}
                    className="text-sm"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Quantity *</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = e.target.value
                      const parsed = parseFloat(value)
                      if (!isNaN(parsed) || value === '' || value === '-') {
                        formState.updateItem(item.id, { quantity: parsed || 0 })
                      }
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0.000"
                    className="text-sm"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Unit *</Label>
                  <Input
                    value={item.unit}
                    onChange={(e) => formState.updateItem(item.id, { unit: e.target.value })}
                    placeholder="e.g., NOS, KG"
                    className="text-sm"
                  />
                </div>

                {/* Unit Price */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Unit Price (₹) *</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const value = e.target.value
                      const parsed = parseFloat(value)
                      if (!isNaN(parsed) || value === '' || value === '-') {
                        formState.updateItem(item.id, { unitPrice: parsed || 0 })
                      }
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>

                {/* Discount */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Discount (%)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={item.discount}
                    onChange={(e) => {
                      const value = e.target.value
                      const parsed = parseFloat(value)
                      if ((!isNaN(parsed) && parsed >= 0 && parsed <= 100) || value === '' || value === '-') {
                        formState.updateItem(item.id, { discount: parsed || 0 })
                      }
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>

                {/* Amount (Read-only) */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Amount</Label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <Button onClick={formState.addItem} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Item
          </Button>
        </div>
      )}
    </div>
  )
}
