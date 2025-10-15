/**
 * Audit Logs API
 * GET /api/audit - Query audit logs with filters and pagination
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import { successResponse } from '@/lib/api/error-handler'
import { AuditAction } from '@/generated/prisma'

export async function GET(request: NextRequest) {
  // Authentication check
  const { error } = await requireAuth()
  if (error) return error

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const cursor = searchParams.get('cursor') || undefined

    // Filters
    const entity = searchParams.get('entity') || undefined // "quotation", "company", "customer"
    const action = searchParams.get('action') || undefined // "CREATE", "UPDATE", "DELETE", "RESTORE"
    const userId = searchParams.get('userId') || undefined
    const entityId = searchParams.get('entityId') || undefined
    const search = searchParams.get('search') || undefined // Search in description or userEmail

    // Date range filters
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (entity) where.entity = entity
    if (action && Object.values(AuditAction).includes(action as AuditAction)) {
      where.action = action as AuditAction
    }
    if (userId) where.userId = userId
    if (entityId) where.entityId = entityId

    // Search in description or userEmail
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Cursor-based pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryOptions: any = {
      where,
      take: limit + 1, // Fetch one extra to check if there are more
      orderBy: { createdAt: 'desc' as const },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        userId: true,
        userEmail: true,
        description: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        // Don't include before/after/changes/metadata in list view for performance
      },
    }

    // Add cursor if provided
    if (cursor) {
      queryOptions.cursor = { id: cursor }
      queryOptions.skip = 1 // Skip the cursor itself
    }

    // Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany(queryOptions)

    // Check if there are more results
    const hasMore = auditLogs.length > limit
    const logs = hasMore ? auditLogs.slice(0, limit) : auditLogs
    const nextCursor = hasMore ? logs[logs.length - 1].id : null

    return successResponse({
      logs,
      pagination: {
        hasMore,
        nextCursor,
        limit,
      },
    })
  } catch (err) {
    console.error('[Audit API] Error fetching audit logs:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
