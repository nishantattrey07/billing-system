'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuditLogsFilters } from '@/lib/hooks/useAuditLogs'

interface AuditLogFiltersProps {
  filters: AuditLogsFilters
  onFiltersChange: (filters: AuditLogsFilters) => void
}

export function AuditLogFilters({ filters, onFiltersChange }: AuditLogFiltersProps) {
  const [search, setSearch] = useState(filters.search || '')

  // Count active filters (excluding search and limit)
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'search' && key !== 'limit'
  ).length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // Debounce would be better, but for simplicity updating immediately
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleEntityChange = (value: string) => {
    onFiltersChange({ ...filters, entity: value === 'all' ? undefined : value })
  }

  const handleActionChange = (value: string) => {
    onFiltersChange({ ...filters, action: value === 'all' ? undefined : value })
  }

  const handleDateRangeChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, startDate: undefined, endDate: undefined })
      return
    }

    const now = new Date()
    let startDate: Date | undefined

    switch (value) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
    }

    onFiltersChange({
      ...filters,
      startDate: startDate?.toISOString(),
      endDate: now.toISOString(),
    })
  }

  const clearAllFilters = () => {
    setSearch('')
    onFiltersChange({ limit: filters.limit })
  }

  // Determine current date range value
  const getCurrentDateRange = (): string => {
    if (!filters.startDate || !filters.endDate) return 'all'

    const start = new Date(filters.startDate)
    const end = new Date(filters.endDate)
    const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))

    if (diffDays <= 7) return '7days'
    if (diffDays <= 30) return '30days'
    if (diffDays <= 90) return '90days'
    return 'all'
  }

  return (
    <div className="space-y-4">
      {/* Search and Clear Button Row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by description or user email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={clearAllFilters} className="shrink-0">
            <X className="h-4 w-4 mr-2" />
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {/* Entity Type Filter */}
        <Select value={filters.entity || 'all'} onValueChange={handleEntityChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="quotation">Quotations</SelectItem>
            <SelectItem value="company">Companies</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="challan">Challans</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Type Filter */}
        <Select value={filters.action || 'all'} onValueChange={handleActionChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Created</SelectItem>
            <SelectItem value="UPDATE">Updated</SelectItem>
            <SelectItem value="DELETE">Deleted</SelectItem>
            <SelectItem value="RESTORE">Restored</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select value={getCurrentDateRange()} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.entity && (
            <Badge variant="secondary" className="gap-1">
              Entity: {filters.entity}
              <button
                onClick={() => handleEntityChange('all')}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.action && (
            <Badge variant="secondary" className="gap-1">
              Action: {filters.action}
              <button
                onClick={() => handleActionChange('all')}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(filters.startDate || filters.endDate) && (
            <Badge variant="secondary" className="gap-1">
              Date Range: {getCurrentDateRange() === '7days' ? 'Last 7 Days' : getCurrentDateRange() === '30days' ? 'Last 30 Days' : 'Last 3 Months'}
              <button
                onClick={() => handleDateRangeChange('all')}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
