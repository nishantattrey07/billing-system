/**
 * React Query hooks for Audit Logs
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AuditAction } from '@/generated/prisma'

// Types
export interface AuditLogListItem {
  id: string
  action: AuditAction
  entity: string
  entityId: string
  userId: string
  userEmail: string | null
  description: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditLogDetail extends AuditLogListItem {
  before: unknown | null
  after: unknown | null
  changes: unknown | null
  metadata: unknown | null
}

export interface AuditLogsResponse {
  logs: AuditLogListItem[]
  pagination: {
    hasMore: boolean
    nextCursor: string | null
    limit: number
  }
}

export interface EntityAuditHistoryResponse {
  entity: string
  entityId: string
  history: AuditLogDetail[]
  totalChanges: number
}

export interface AuditLogsFilters {
  entity?: string
  action?: string
  userId?: string
  entityId?: string
  search?: string
  startDate?: string
  endDate?: string
  limit?: number
}

/**
 * Hook to fetch audit logs with infinite scroll pagination
 */
export function useAuditLogs(filters: AuditLogsFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams()

      // Add filters
      if (filters.entity) params.append('entity', filters.entity)
      if (filters.action) params.append('action', filters.action)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.entityId) params.append('entityId', filters.entityId)
      if (filters.search) params.append('search', filters.search)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (pageParam) params.append('cursor', pageParam)

      const response = await fetch(`/api/audit?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const { data } = await response.json()
      return data as AuditLogsResponse
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined
    },
    initialPageParam: undefined,
  })
}

/**
 * Hook to fetch audit history for a specific entity
 */
export function useEntityAuditHistory(entity: string, entityId: string) {
  return useQuery({
    queryKey: ['auditHistory', entity, entityId],
    queryFn: async () => {
      const response = await fetch(`/api/audit/${entity}/${entityId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch entity audit history')
      }

      const { data } = await response.json()
      return data as EntityAuditHistoryResponse
    },
    enabled: !!entity && !!entityId,
  })
}
