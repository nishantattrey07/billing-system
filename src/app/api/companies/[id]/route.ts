import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validation/schemas/company.schema'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { convertEmptyStringsToUndefined } from '@/lib/api/transform-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const company = await prisma.company.findUnique({
      where: { id },
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
    const { id } = await params
    const body = await request.json()

    const result = companySchema.partial().safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }


    const data = convertEmptyStringsToUndefined(result.data)

    const company = await prisma.company.update({
      where: { id },
      data,
    })

    return successResponse(company)
  } catch (error) {
    return handleApiError(error)
  }
}
