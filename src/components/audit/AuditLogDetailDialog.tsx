'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  FileText,
  Building2,
  Users,
  Receipt,
  Package,
  Copy,
  Check,
  Monitor,
  MapPin,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AuditAction } from '@/generated/prisma'
import { AuditLogListItem } from '@/lib/hooks/useAuditLogs'
import { AuditLogDiff } from './AuditLogDiff'

interface AuditLogDetailDialogProps {
  log: AuditLogListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function AuditLogDetailDialog({ log, open, onOpenChange }: AuditLogDetailDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [fullLog, setFullLog] = useState<{
    before: unknown
    after: unknown
    changes: unknown
    metadata: unknown
  } | null>(null)

  // Fetch full log details when dialog opens
  useEffect(() => {
    if (open && log) {
      fetch(`/api/audit/${log.entity}/${log.entityId}`)
        .then((res) => res.json())
        .then((data) => {
          const logDetail = data.data.history.find((h: { id: string }) => h.id === log.id)
          if (logDetail) {
            setFullLog({
              before: logDetail.before,
              after: logDetail.after,
              changes: logDetail.changes,
              metadata: logDetail.metadata,
            })
          }
        })
        .catch((err) => console.error('Failed to fetch log details:', err))
    }
  }, [open, log])

  if (!log) return null

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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${entityInfo.bgColor}`}>
              <EntityIcon className={`h-6 w-6 ${entityInfo.color}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <span className="capitalize">{log.entity}</span>
                <Badge className={actionInfo.className}>{actionInfo.label}</Badge>
              </DialogTitle>
              <DialogDescription>
                {format(new Date(log.createdAt), 'MMMM dd, yyyy \'at\' HH:mm:ss')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* User & Request Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* User Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{log.userEmail || 'Unknown'}</div>
                <div className="text-xs text-muted-foreground">User ID: {log.userId}</div>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="rounded-lg border p-4 space-y-2">
            {log.ipAddress && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{log.ipAddress}</span>
              </div>
            )}
            {log.userAgent && (
              <div className="flex items-start gap-2 text-sm">
                <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-xs text-muted-foreground line-clamp-2">{log.userAgent}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {log.description && (
          <div className="rounded-lg bg-muted/50 p-3 mb-4">
            <p className="text-sm">{log.description}</p>
          </div>
        )}

        {/* Tabs for Details */}
        <Tabs defaultValue="changes" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="changes" className="mt-0">
              {fullLog ? (
                <AuditLogDiff
                  action={log.action as AuditAction}
                  before={fullLog.before}
                  after={fullLog.after}
                  changes={fullLog.changes}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">Loading changes...</div>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="mt-0">
              {fullLog?.metadata ? (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Metadata</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(fullLog.metadata, null, 2), 'metadata')}
                    >
                      {copiedField === 'metadata' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-xs font-mono">{JSON.stringify(fullLog.metadata, null, 2)}</pre>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No metadata available</div>
              )}
            </TabsContent>

            <TabsContent value="raw" className="mt-0 space-y-4">
              {/* Entity ID */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Entity ID</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log.entityId, 'entityId')}
                  >
                    {copiedField === 'entityId' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <code className="text-xs font-mono">{log.entityId}</code>
              </div>

              {/* Full Before/After */}
              {fullLog && (
                <>
                  {fullLog.before && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Before</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(fullLog.before, null, 2), 'before')}
                        >
                          {copiedField === 'before' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <pre className="text-xs font-mono">{JSON.stringify(fullLog.before, null, 2)}</pre>
                      </ScrollArea>
                    </div>
                  )}

                  {fullLog.after && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">After</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(fullLog.after, null, 2), 'after')}
                        >
                          {copiedField === 'after' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <pre className="text-xs font-mono">{JSON.stringify(fullLog.after, null, 2)}</pre>
                      </ScrollArea>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
