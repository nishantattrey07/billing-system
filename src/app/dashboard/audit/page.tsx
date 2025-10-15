'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Shield, Loader2, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuditLogs, AuditLogsFilters, AuditLogListItem, AuditLogsResponse } from '@/lib/hooks/useAuditLogs'
import { AuditLogCard } from '@/components/audit/AuditLogCard'
import { AuditLogTable } from '@/components/audit/AuditLogTable'
import { AuditLogFilters } from '@/components/audit/AuditLogFilters'
import { AuditLogDetailDialog } from '@/components/audit/AuditLogDetailDialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogsFilters>({ limit: 50 })
  const [selectedLog, setSelectedLog] = useState<AuditLogListItem | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAuditLogs(filters)

  // Flatten all pages of logs
  const allLogs = useMemo(() => {
    if (!data?.pages) return []
    const pages = data.pages as AuditLogsResponse[]
    return pages.flatMap((page) => page.logs)
  }, [data])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {allLogs.length > 0 ? `${allLogs.length} log${allLogs.length === 1 ? '' : 's'}` : 'Track all system changes and user activities'}
            </p>
          </div>

          {/* View Mode Toggle - Desktop Only */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <AuditLogFilters filters={filters} onFiltersChange={setFilters} />
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {viewMode === 'card' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && allLogs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 mb-4">
            <Shield className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {Object.keys(filters).some((k) => k !== 'limit' && filters[k as keyof AuditLogsFilters])
              ? 'No logs found'
              : 'No audit logs yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {Object.keys(filters).some((k) => k !== 'limit' && filters[k as keyof AuditLogsFilters])
              ? 'Try adjusting your filters to see more results'
              : 'Audit logs will appear here when users perform actions'}
          </p>
        </motion.div>
      )}

      {/* Logs Display */}
      {!isLoading && allLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {viewMode === 'card' || window.innerWidth < 768 ? (
            // Card View (Mobile + Desktop)
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AuditLogCard log={log} onViewDetails={setSelectedLog} />
                </motion.div>
              ))}
            </div>
          ) : (
            // Table View (Desktop Only)
            <AuditLogTable logs={allLogs} onViewDetails={setSelectedLog} />
          )}
        </motion.div>
      )}

      {/* Load More Button */}
      {hasNextPage && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <AuditLogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  )
}
