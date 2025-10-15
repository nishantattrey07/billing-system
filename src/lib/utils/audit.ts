/**
 * Audit Logging Utility
 * Centralized system for tracking all CUD operations with complete context
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/lib/prisma'
import { AuditAction } from '@/generated/prisma'
import { NextRequest } from 'next/server'

// Sensitive fields to exclude from audit logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'privateKey',
  'accessToken',
  'refreshToken',
]

export interface AuditLogParams {
  action: AuditAction
  entity: string
  entityId: string
  userId: string
  userEmail?: string
  before?: any
  after?: any
  description?: string
  metadata?: Record<string, any>
  request?: NextRequest
}

/**
 * Main audit logging function
 * Logs an action to the audit_logs table with complete context
 *
 * @param params - Audit log parameters
 * @returns Promise that resolves when log is created (non-blocking)
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const {
      action,
      entity,
      entityId,
      userId,
      userEmail,
      before,
      after,
      description,
      metadata,
      request,
    } = params

    // Extract request metadata if provided
    const requestMetadata = extractMetadata(request)

    // Sanitize sensitive data from before/after snapshots
    const sanitizedBefore = before ? sanitizeData(before) : null
    const sanitizedAfter = after ? sanitizeData(after) : null

    // Compute changes between before and after
    const changes =
      sanitizedBefore && sanitizedAfter
        ? computeChanges(sanitizedBefore, sanitizedAfter)
        : null

    // Generate description if not provided
    const finalDescription =
      description || generateDescription(action, entity, changes)

    // Create audit log (async, non-blocking)
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        userEmail: userEmail || null,
        before: sanitizedBefore,
        after: sanitizedAfter,
        changes: changes || undefined, // Use undefined instead of null for JSON fields
        ipAddress: requestMetadata.ipAddress || null,
        userAgent: requestMetadata.userAgent || null,
        description: finalDescription,
        metadata: metadata || undefined, // Use undefined instead of null for JSON fields
      },
    })
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('[Audit] Failed to create audit log:', error)
    // In production, you might want to send this to error monitoring service
  }
}

/**
 * Compute differences between before and after objects
 * Returns only the changed fields with old and new values
 *
 * @param before - Object state before change
 * @param after - Object state after change
 * @returns Object with changed fields and their old/new values
 */
function computeChanges(
  before: Record<string, any>,
  after: Record<string, any>
): Record<string, { old: any; new: any }> | null {
  const changes: Record<string, { old: any; new: any }> = {}

  // Find all keys from both objects
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of allKeys) {
    const oldValue = before[key]
    const newValue = after[key]

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      continue
    }

    // Skip internal fields that change automatically
    if (['updatedAt', 'createdAt'].includes(key)) {
      continue
    }

    changes[key] = {
      old: oldValue,
      new: newValue,
    }
  }

  return Object.keys(changes).length > 0 ? changes : null
}

/**
 * Extract IP address and User-Agent from request headers
 *
 * @param request - NextRequest object
 * @returns Object with ipAddress and userAgent
 */
function extractMetadata(request?: NextRequest): {
  ipAddress?: string
  userAgent?: string
} {
  if (!request) {
    return {}
  }

  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    undefined

  const userAgent = request.headers.get('user-agent') || undefined

  return { ipAddress, userAgent }
}

/**
 * Sanitize sensitive data from objects before logging
 * Recursively removes sensitive fields
 *
 * @param data - Object to sanitize
 * @param sensitiveFields - Array of field names to remove
 * @returns Sanitized object
 */
function sanitizeData(
  data: any,
  sensitiveFields: string[] = SENSITIVE_FIELDS
): any {
  if (data === null || data === undefined) {
    return data
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, sensitiveFields))
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]'
        continue
      }

      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(value, sensitiveFields)
    }

    return sanitized
  }

  // Return primitive values as-is
  return data
}

/**
 * Generate human-readable description for audit log
 *
 * @param action - Audit action type
 * @param entity - Entity type
 * @param changes - Object of changed fields (optional)
 * @returns Human-readable description
 */
function generateDescription(
  action: AuditAction,
  entity: string,
  changes?: Record<string, { old: any; new: any }> | null
): string {
  const actionVerb = {
    CREATE: 'Created',
    UPDATE: 'Updated',
    DELETE: 'Deleted',
    RESTORE: 'Restored',
  }[action]

  let description = `${actionVerb} ${entity}`

  // Add changed fields for UPDATE actions
  if (action === 'UPDATE' && changes && Object.keys(changes).length > 0) {
    const changedFields = Object.keys(changes).join(', ')
    description += ` (changed: ${changedFields})`
  }

  return description
}

/**
 * Helper to log CREATE action
 */
export async function logCreate(params: Omit<AuditLogParams, 'action'>) {
  return logAudit({ ...params, action: 'CREATE' })
}

/**
 * Helper to log UPDATE action
 */
export async function logUpdate(params: Omit<AuditLogParams, 'action'>) {
  return logAudit({ ...params, action: 'UPDATE' })
}

/**
 * Helper to log DELETE action
 */
export async function logDelete(params: Omit<AuditLogParams, 'action'>) {
  return logAudit({ ...params, action: 'DELETE' })
}

/**
 * Helper to log RESTORE action
 */
export async function logRestore(params: Omit<AuditLogParams, 'action'>) {
  return logAudit({ ...params, action: 'RESTORE' })
}
