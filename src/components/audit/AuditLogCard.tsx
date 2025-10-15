'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Building2,
  Users,
  Receipt,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AuditAction } from '@/generated/prisma'
import { AuditLogListItem } from '@/lib/hooks/useAuditLogs'

interface AuditLogCardProps {
  log: AuditLogListItem
  onViewDetails?: (log: AuditLogListItem) => void
}

// Action color config
const actionConfig = {
  CREATE: {
    label: 'Created',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  UPDATE: {
    label: 'Updated',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  DELETE: {
    label: 'Deleted',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  RESTORE: {
    label: 'Restored',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
}

// Entity icon and color config
const entityConfig: Record<string, { icon: typeof FileText; color: string; bgColor: string }> = {
  quotation: {
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
  company: {
    icon: Building2,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
  },
  customer: {
    icon: Users,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-950',
  },
  invoice: {
    icon: Receipt,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950',
  },
  challan: {
    icon: Package,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
}

export function AuditLogCard({ log, onViewDetails }: AuditLogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actionInfo = actionConfig[log.action as AuditAction]
  const entityInfo = entityConfig[log.entity] || entityConfig.quotation

  const EntityIcon = entityInfo.icon

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })

  // Get user initials
  const userInitials = log.userEmail
    ? log.userEmail
        .split('@')[0]
        .split('.')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-start gap-3 mb-3">
            {/* Entity Icon */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${entityInfo.bgColor} flex-shrink-0`}>
              <EntityIcon className={`h-5 w-5 ${entityInfo.color}`} />
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className={actionInfo.className}>{actionInfo.label}</Badge>
                <span className="text-sm font-medium capitalize">{log.entity}</span>
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 p-1 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Description */}
          {log.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{log.description}</p>
          )}

          {/* User Info - Always Visible */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{log.userEmail || 'Unknown'}</span>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                  {log.ipAddress && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-[60px]">IP:</span>
                      <span className="font-mono">{log.ipAddress}</span>
                    </div>
                  )}
                  {log.userAgent && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-[60px]">Device:</span>
                      <span className="truncate">{log.userAgent}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground min-w-[60px]">Entity ID:</span>
                    <span className="font-mono text-[10px]">{log.entityId}</span>
                  </div>

                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(log)}
                      className="mt-3 w-full py-2 text-sm font-medium text-primary hover:bg-muted rounded transition-colors"
                    >
                      View Full Details
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
