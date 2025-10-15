/**
 * Entity-Specific Audit History API
 * GET /api/audit/[entity]/[id] - Get complete audit history for a specific entity
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import { successResponse } from '@/lib/api/error-handler'

interface RouteParams {
  params: Promise<{
    entity: string
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Authentication check
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { entity, id } = await params

    // Validate entity type
    const validEntities = ['quotation', 'company', 'customer', 'invoice', 'challan']
    if (!validEntities.includes(entity)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity type' },
        { status: 400 }
      )
    }

    // Fetch all audit logs for this entity
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity,
        entityId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        userId: true,
        userEmail: true,
        before: true,
        after: true,
        changes: true,
        description: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true,
      },
    })

    return successResponse({
      entity,
      entityId: id,
      history: auditLogs,
      totalChanges: auditLogs.length,
    })
  } catch (err) {
    console.error('[Audit API] Error fetching entity history:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch entity history' },
      { status: 500 }
    )
  }
}
