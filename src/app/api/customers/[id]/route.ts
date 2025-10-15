import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { customerSchema } from '@/lib/validation/schemas/customer.schema'
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

    const customer = await prisma.customer.findUnique({
      where: {
        id,
        deletedAt: null, // Only fetch non-deleted customers
      },
    })

    if (!customer) {
      return handleApiError(new Error('Customer not found'))
    }

    return successResponse(customer)
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


    const result = customerSchema.partial().safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    // Fetch existing customer for audit trail
    const existing = await prisma.customer.findUnique({
      where: {
        id,
        deletedAt: null, // Cannot update deleted customers
      },
    })

    if (!existing) {
      return handleApiError(new Error('Customer not found'))
    }

    const data = convertEmptyStringsToUndefined(result.data)


    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        updatedBy: user!.id, // Audit trail
      },
    })

    // Log audit trail for UPDATE action
    await logUpdate({
      entity: 'customer',
      entityId: id,
      userId: user!.id,
      userEmail: user!.email,
      before: existing,
      after: customer,
      description: `Updated customer ${customer.name}`,
      request,
    })

    return successResponse(customer)
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

    // Check if customer exists and is not already deleted
    const existing = await prisma.customer.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return handleApiError(new Error('Customer not found'))
    }

    // Soft delete customer (mark as deleted instead of removing)
    await prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: user!.id,
      },
    })

    // Log audit trail for DELETE action
    await logDelete({
      entity: 'customer',
      entityId: id,
      userId: user!.id,
      userEmail: user!.email,
      before: existing,
      description: `Deleted customer ${existing.name}`,
      request,
    })

    return successResponse({ message: 'Customer deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
