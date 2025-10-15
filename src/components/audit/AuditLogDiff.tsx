'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { AuditAction } from '@/generated/prisma'

interface AuditLogDiffProps {
  action: AuditAction
  before: unknown | null
  after: unknown | null
  changes: unknown | null
}

export function AuditLogDiff({ action, before, after, changes }: AuditLogDiffProps) {
  // Helper function to safely parse JSON
  const parseData = (data: unknown) => {
    if (!data) return null
    try {
      return typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return data
    }
  }

  const beforeData = parseData(before)
  const afterData = parseData(after)
  const changesData = parseData(changes)

  // Get changed field keys
  const changedFields = changesData
    ? Object.keys(changesData as Record<string, unknown>)
    : []

  // CREATE action - only show after
  if (action === 'CREATE') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Created Record</h3>
          <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
            <pre className="text-xs font-mono">
              {JSON.stringify(afterData, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </div>
    )
  }

  // DELETE action - only show before
  if (action === 'DELETE') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Deleted Record</h3>
          <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
            <pre className="text-xs font-mono">
              {JSON.stringify(beforeData, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </div>
    )
  }

  // UPDATE/RESTORE action - show side-by-side diff
  if (changedFields.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium">Changed Fields</h3>
          <Badge variant="outline">{changedFields.length} changes</Badge>
        </div>

        <div className="space-y-3">
          {changedFields.map((field) => {
            const change = (changesData as Record<string, { old: unknown; new: unknown }>)[field]
            const oldValue = change?.old
            const newValue = change?.new

            return (
              <div key={field} className="rounded-lg border p-3 space-y-2">
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {field}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Before */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Before</div>
                    <div className="rounded bg-red-50 dark:bg-red-950/30 p-2 border border-red-200 dark:border-red-900">
                      <pre className="text-xs font-mono text-red-900 dark:text-red-300 whitespace-pre-wrap break-words">
                        {oldValue === null
                          ? 'null'
                          : oldValue === undefined
                          ? 'undefined'
                          : typeof oldValue === 'object'
                          ? JSON.stringify(oldValue, null, 2)
                          : String(oldValue)}
                      </pre>
                    </div>
                  </div>

                  {/* After */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">After</div>
                    <div className="rounded bg-green-50 dark:bg-green-950/30 p-2 border border-green-200 dark:border-green-900">
                      <pre className="text-xs font-mono text-green-900 dark:text-green-300 whitespace-pre-wrap break-words">
                        {newValue === null
                          ? 'null'
                          : newValue === undefined
                          ? 'undefined'
                          : typeof newValue === 'object'
                          ? JSON.stringify(newValue, null, 2)
                          : String(newValue)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Fallback: Show full before/after side by side
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Full Record Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before */}
        <div>
          <div className="text-sm font-medium mb-2">Before</div>
          <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
            <pre className="text-xs font-mono">
              {JSON.stringify(beforeData, null, 2)}
            </pre>
          </ScrollArea>
        </div>

        {/* After */}
        <div>
          <div className="text-sm font-medium mb-2">After</div>
          <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
            <pre className="text-xs font-mono">
              {JSON.stringify(afterData, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
