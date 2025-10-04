import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { customerSchema } from '@/lib/validation/schemas/customer.schema'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { convertEmptyStringsToUndefined } from '@/lib/api/transform-data'
import { requireAuth } from '@/lib/api/auth'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { user, error } = await requireAuth(request)
    if (error) return error

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
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
    const { user, error } = await requireAuth(request)
    if (error) return error

    const { id } = await params
    const body = await request.json()


    const result = customerSchema.partial().safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }


    const data = convertEmptyStringsToUndefined(result.data)


    const customer = await prisma.customer.update({
      where: { id },
      data,
    })

    return successResponse(customer)
  } catch (error) {
    return handleApiError(error)
  }
}
