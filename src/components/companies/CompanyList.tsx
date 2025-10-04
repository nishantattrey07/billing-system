'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Plus, Loader2, Building2 } from 'lucide-react'
import Link from 'next/link'

import { useCompanies } from '@/lib/hooks/useCompanies'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompanyCard } from './CompanyCard'
import { CompanyListSkeleton } from './CompanyListSkeleton'

export function CompanyList() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const t = useTranslations('company')
  const tCommon = useTranslations('common')

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCompanies(debouncedSearch)

  // Flatten all pages into single array
  const companies = data?.pages.flatMap((page) => page.data) || []
  const totalLoaded = companies.length

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalLoaded > 0 && `${totalLoaded} ${t('title').toLowerCase()}`}
          </p>
        </div>
        <Link href="/companies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`${tCommon('search')} ${t('title').toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading State */}
      {isLoading && <CompanyListSkeleton />}

      {/* Empty State */}
      {!isLoading && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {search ? 'No companies found' : `No ${t('title').toLowerCase()} yet`}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {search
              ? 'Try adjusting your search terms'
              : `Get started by creating your first ${t('title').toLowerCase().slice(0, -1)}`}
          </p>
          {!search && (
            <Link href="/companies/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('addNew')}
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Companies Grid */}
      {!isLoading && companies.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  `Load more`
                )}
              </Button>
            </div>
          )}

          {/* Pagination Info */}
          {!hasNextPage && totalLoaded > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Showing all {totalLoaded} {t('title').toLowerCase()}
            </p>
          )}
        </>
      )}
    </div>
  )
}
