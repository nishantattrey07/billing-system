import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validation/schemas/company.schema'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { convertEmptyStringsToUndefined } from '@/lib/api/transform-data'
import { requireAuth } from '@/lib/api/auth'
import { logUpdate, logDelete } from '@/lib/utils/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params

    const company = await prisma.company.findUnique({
      where: {
        id,
        deletedAt: null, // Only fetch non-deleted companies
      },
    })

    if (!company) {
      return handleApiError(new Error('Company not found'))
    }

    return successResponse(company)
  } catch (error) {
    return handleApiError(error)
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const body = await request.json()

    const result = companySchema.partial().safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    // Fetch existing company for audit trail
    const existing = await prisma.company.findUnique({
      where: {
        id,
        deletedAt: null, // Cannot update deleted companies
      },
    })

    if (!existing) {
      return handleApiError(new Error('Company not found'))
    }

    const data = convertEmptyStringsToUndefined(result.data)

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...data,
        updatedBy: user!.id, // Audit trail
      },
    })

    // Log audit trail for UPDATE action
    await logUpdate({
      entity: 'company',
      entityId: id,
      userId: user!.id,
      userEmail: user!.email,
      before: existing,
      after: company,
      description: `Updated company ${company.name}`,
      request,
    })

    return successResponse(company)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    // Check if company exists and is not already deleted
    const existing = await prisma.company.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return handleApiError(new Error('Company not found'))
    }

    // Soft delete company (mark as deleted instead of removing)
    await prisma.company.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: user!.id,
      },
    })

    // Log audit trail for DELETE action
    await logDelete({
      entity: 'company',
      entityId: id,
      userId: user!.id,
      userEmail: user!.email,
      before: existing,
      description: `Deleted company ${existing.name}`,
      request,
    })

    return successResponse({ message: 'Company deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
