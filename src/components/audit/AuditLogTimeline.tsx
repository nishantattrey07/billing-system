'use client'

import { useState } from 'react'
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AuditAction } from '@/generated/prisma'
import { useEntityAuditHistory, AuditLogDetail } from '@/lib/hooks/useAuditLogs'
import { AuditLogDiff } from './AuditLogDiff'

interface AuditLogTimelineProps {
  entity: string
  entityId: string
}

// Action color config
const actionConfig = {
  CREATE: {
    label: 'Created',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    dotColor: 'bg-green-500',
  },
  UPDATE: {
    label: 'Updated',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  DELETE: {
    label: 'Deleted',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
  RESTORE: {
    label: 'Restored',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    dotColor: 'bg-orange-500',
  },
}

// Group logs by date
function groupLogsByDate(logs: AuditLogDetail[]): Record<string, AuditLogDetail[]> {
  const grouped: Record<string, AuditLogDetail[]> = {}

  logs.forEach((log) => {
    const date = new Date(log.createdAt)
    let key: string

    if (isToday(date)) {
      key = 'Today'
    } else if (isYesterday(date)) {
      key = 'Yesterday'
    } else if (isThisWeek(date)) {
      key = format(date, 'EEEE') // Day name
    } else {
      key = format(date, 'MMMM dd, yyyy')
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(log)
  })

  return grouped
}

function TimelineItem({ log, isLast }: { log: AuditLogDetail; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actionInfo = actionConfig[log.action as AuditAction]
  const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })

  return (
    <div className="relative">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 w-[2px] h-full bg-border" />
      )}

      {/* Timeline Item */}
      <div className="flex gap-4 pb-6">
        {/* Dot */}
        <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${actionInfo.dotColor} flex-shrink-0`}>
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className={actionInfo.className}>{actionInfo.label}</Badge>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {log.description && (
            <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
          )}

          <div className="text-xs text-muted-foreground mb-2">
            by {log.userEmail || 'Unknown'}
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs h-7"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide Changes
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                View Changes
              </>
            )}
          </Button>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <div className="rounded-lg border bg-card p-4">
                  <AuditLogDiff
                    action={log.action as AuditAction}
                    before={log.before}
                    after={log.after}
                    changes={log.changes}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export function AuditLogTimeline({ entity, entityId }: AuditLogTimelineProps) {
  const { data, isLoading, error } = useEntityAuditHistory(entity, entityId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Failed to load audit history</p>
      </div>
    )
  }

  if (!data || data.history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No History Yet</h3>
        <p className="text-sm text-muted-foreground">
          No changes have been recorded for this {entity}
        </p>
      </div>
    )
  }

  const groupedLogs = groupLogsByDate(data.history)

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-8">
        {/* Summary Header */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">
              {data.totalChanges} change{data.totalChanges === 1 ? '' : 's'}
            </div>
            <div className="text-xs text-muted-foreground">
              Complete audit trail for this {entity}
            </div>
          </div>
        </div>

        {/* Timeline by Date Groups */}
        {Object.entries(groupedLogs).map(([dateLabel, logs]) => (
          <div key={dateLabel}>
            <div className="text-sm font-semibold mb-4 text-muted-foreground">
              {dateLabel}
            </div>
            <div>
              {logs.map((log, index) => (
                <TimelineItem
                  key={log.id}
                  log={log}
                  isLast={index === logs.length - 1 && dateLabel === Object.keys(groupedLogs)[Object.keys(groupedLogs).length - 1]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
