'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Plus, FileText, Filter } from 'lucide-react'
import Link from 'next/link'

import { useQuotations } from '@/lib/hooks/useQuotations'
import { useAllCompanies } from '@/lib/hooks/useCompanies'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuotationCard } from './QuotationCard'
import { QuotationListSkeleton } from './QuotationListSkeleton'

interface QuotationListItem {
  id: string
  number: string
  date: Date | string
  customerName: string
  financialYear: string
  total: number | string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'UNPAID'
  company: {
    id: string
    name: string
    gstin: string
  }
}

export function QuotationList() {
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const debouncedSearch = useDebounce(search, 500)

  // Fetch companies for filter
  const { data: companiesData } = useAllCompanies()
  const companies = companiesData || []

  // Build query params
  const queryParams: {
    search?: string
    companyId?: string
    status?: string
  } = {}

  if (debouncedSearch) queryParams.search = debouncedSearch
  if (companyFilter !== 'all') queryParams.companyId = companyFilter
  if (statusFilter !== 'all') queryParams.status = statusFilter

  const { data, isLoading } = useQuotations(queryParams)

  // Extract quotations from response
  const quotations = data?.data?.data || []
  const totalLoaded = quotations.length

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quotations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalLoaded > 0 && `${totalLoaded} quotation${totalLoaded === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link href="/dashboard/quotations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Company Filter */}
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && <QuotationListSkeleton />}

      {/* Empty State */}
      {!isLoading && quotations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {search || companyFilter !== 'all' || statusFilter !== 'all'
              ? 'No quotations found'
              : 'No quotations yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {search || companyFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first quotation'}
          </p>
          {!search && companyFilter === 'all' && statusFilter === 'all' && (
            <Link href="/dashboard/quotations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Quotation
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Quotations Grid */}
      {!isLoading && quotations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(quotations as QuotationListItem[]).map((quotation) => (
            <QuotationCard key={quotation.id} quotation={quotation} />
          ))}
        </div>
      )}
    </div>
  )
}
