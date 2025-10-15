'use client'

import { format } from 'date-fns'
import {
  FileText,
  Building2,
  Users,
  Receipt,
  Package,
  Eye,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AuditAction } from '@/generated/prisma'
import { AuditLogListItem } from '@/lib/hooks/useAuditLogs'

interface AuditLogTableProps {
  logs: AuditLogListItem[]
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
const entityConfig: Record<string, { icon: typeof FileText; color: string }> = {
  quotation: { icon: FileText, color: 'text-purple-600 dark:text-purple-400' },
  company: { icon: Building2, color: 'text-orange-600 dark:text-orange-400' },
  customer: { icon: Users, color: 'text-teal-600 dark:text-teal-400' },
  invoice: { icon: Receipt, color: 'text-green-600 dark:text-green-400' },
  challan: { icon: Package, color: 'text-purple-600 dark:text-purple-400' },
}

export function AuditLogTable({ logs, onViewDetails }: AuditLogTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Time</TableHead>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
            <TableHead className="w-[120px]">Entity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No audit logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const actionInfo = actionConfig[log.action as AuditAction]
              const entityInfo = entityConfig[log.entity] || entityConfig.quotation
              const EntityIcon = entityInfo.icon

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
                <TableRow
                  key={log.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewDetails?.(log)}
                >
                  {/* Time */}
                  <TableCell className="text-sm">
                    <div>{format(new Date(log.createdAt), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), 'HH:mm:ss')}
                    </div>
                  </TableCell>

                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate max-w-[150px]">
                        {log.userEmail || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <Badge className={actionInfo.className}>{actionInfo.label}</Badge>
                  </TableCell>

                  {/* Entity */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EntityIcon className={`h-4 w-4 ${entityInfo.color}`} />
                      <span className="text-sm capitalize">{log.entity}</span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="max-w-[300px]">
                    <span className="text-sm truncate block">
                      {log.description || 'No description'}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails?.(log)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
