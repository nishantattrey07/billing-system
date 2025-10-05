'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/quotation-calculations'
import type { useQuotationForm } from './hooks/useQuotationForm'

interface QuotationPreviewProps {
  formState: ReturnType<typeof useQuotationForm>
}

export function QuotationPreview({ formState }: QuotationPreviewProps) {
  const [zoom, setZoom] = useState(0.5) // Default 50% to fit on screen
  const isSameState = formState.companyState === formState.customerState

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.3))
  const handleFitToScreen = () => setZoom(0.5)

  return (
    <div className="relative h-full flex flex-col">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleFitToScreen}>
          <Maximize2 className="w-4 h-4 mr-2" />
          Fit to Screen
        </Button>
      </div>

      {/* Preview Container with Scroll */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex justify-center py-4">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ width: '210mm', margin: '0 auto' }} id="quotation-pdf-content">
      {/* A4 Paper Simulation */}
      <div className="p-12">
        {/* Header - Company Name as Typography Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">
            {formState.companyName || 'COMPANY NAME'}
          </h1>
          <div className="h-1 w-24 mx-auto rounded-full" style={{ backgroundColor: 'rgb(37, 99, 235)' }} />
        </div>

        {/* Quotation Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">QUOTATION</h2>
        </div>

        {/* Quotation Details & Customer Info Side by Side */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left - Quotation Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Quotation Details
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex">
                <span className="text-gray-600 w-32">Quotation No:</span>
                <span className="font-medium text-gray-900">{formState.number || '—'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">Date:</span>
                <span className="font-medium text-gray-900">
                  {formState.date ? format(formState.date, 'dd MMM yyyy') : '—'}
                </span>
              </div>
              {formState.validUntil && (
                <div className="flex">
                  <span className="text-gray-600 w-32">Valid Until:</span>
                  <span className="font-medium text-gray-900">
                    {format(formState.validUntil, 'dd MMM yyyy')}
                  </span>
                </div>
              )}
              <div className="flex">
                <span className="text-gray-600 w-32">F.Y.:</span>
                <span className="font-medium text-gray-900">{formState.financialYear}</span>
              </div>
            </div>
          </div>

          {/* Right - Customer Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Bill To
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="font-semibold text-gray-900">
                {formState.customerName || 'Customer Name'}
              </div>
              {formState.customerAddress && (
                <div className="text-gray-700">{formState.customerAddress}</div>
              )}
              {formState.customerCity && (
                <div className="text-gray-700">{formState.customerCity}</div>
              )}
              {formState.customerState && (
                <div className="text-gray-700">{formState.customerState}</div>
              )}
              {formState.customerGstin && (
                <div className="text-gray-700">
                  <span className="font-medium">GSTIN: </span>
                  {formState.customerGstin}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subject */}
        {formState.subject && (
          <div className="mb-6">
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Subject: </span>
              <span className="text-gray-900">{formState.subject}</span>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold uppercase">
                  S.No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold uppercase">
                  Description
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold uppercase">
                  Qty
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold uppercase">
                  Unit
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold uppercase">
                  Rate
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold uppercase">
                  Disc%
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {formState.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border border-gray-300 px-3 py-8 text-center text-gray-400 italic"
                  >
                    No items added yet
                  </td>
                </tr>
              ) : (
                formState.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      <div className="font-medium text-gray-900">{item.name || '—'}</div>
                      {item.remarks && (
                        <div className="text-xs text-gray-600 mt-0.5">{item.remarks}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                      {item.quantity.toFixed(3)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                      {item.unit}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                      {item.discount > 0 ? `${item.discount.toFixed(2)}%` : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-right font-mono font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Calculations Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(formState.subtotal)}</span>
              </div>

              {/* Freight */}
              {formState.freightCharges > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-700">Freight Charges:</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(formState.freightCharges)}
                  </span>
                </div>
              )}

              {/* GST */}
              {formState.customerState && formState.companyState && (
                <>
                  <div className="border-t border-gray-300 pt-2" />
                  {isSameState ? (
                    <>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-700">SGST (9%):</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(formState.sgst)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-700">CGST (9%):</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(formState.cgst)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between py-1">
                      <span className="text-gray-700">IGST (18%):</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(formState.igst)}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Total */}
              <div className="border-t-2 border-gray-900 pt-2 mt-2">
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-gray-900 text-base">Total:</span>
                  <span className="font-mono font-bold text-gray-900 text-base">
                    {formatCurrency(formState.total)}
                  </span>
                </div>
              </div>

              {/* Total in Words */}
              {formState.total > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 italic">
                    Amount in Words: <span className="font-medium">{formState.totalInWords}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        {formState.terms && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Terms & Conditions
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
              {formState.terms}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-end pt-12 border-t border-gray-300">
          <div className="text-sm text-gray-600">
            <div className="font-medium">{formState.companyName || 'Company Name'}</div>
            <div>{formState.companyState}</div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-900 w-48 mb-2" />
            <div className="text-sm font-medium text-gray-700">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
          </div>
        </div>
      </div>
    </div>
  )
}
