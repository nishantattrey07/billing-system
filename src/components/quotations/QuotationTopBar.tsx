'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface QuotationTopBarProps {
  safetyMode: boolean
  onSafetyModeToggle: (value: boolean) => void
  quotationNumber: string
  isDraft: boolean
  lastSaved?: Date
}

export function QuotationTopBar({
  safetyMode,
  onSafetyModeToggle,
  quotationNumber,
  isDraft,
  lastSaved,
}: QuotationTopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/quotations"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>

          <div className="h-6 w-px bg-gray-300" />

          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">
              {quotationNumber || 'New Quotation'}
            </h1>

            {isDraft && (
              <Badge variant="secondary" className="text-xs">
                Draft
              </Badge>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Last Saved */}
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {formatTimeAgo(lastSaved)}
            </span>
          )}

          {/* Safety Mode Toggle */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Label htmlFor="safety-mode" className="text-sm font-medium text-gray-700 cursor-pointer">
              Safety Mode
            </Label>
            <Switch
              id="safety-mode"
              checked={safetyMode}
              onCheckedChange={onSafetyModeToggle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 120) return '1 minute ago'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 7200) return '1 hour ago'
  return `${Math.floor(seconds / 3600)} hours ago`
}
