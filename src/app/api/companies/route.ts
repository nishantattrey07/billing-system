import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validation/schemas/company.schema'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { parsePaginationParams, processCursorPagination } from '@/lib/api/cursor-pagination'
import { convertEmptyStringsToUndefined } from '@/lib/api/transform-data'
import { requireAuth } from '@/lib/api/auth'
import { logCreate } from '@/lib/utils/audit'


export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const { cursor, limit = 20, search } = parsePaginationParams(searchParams)


    const where = search
      ? {
          deletedAt: null, // Only fetch non-deleted companies
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { gstin: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { deletedAt: null } // Only fetch non-deleted companies


    const companies = await prisma.company.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const result = processCursorPagination(companies, limit)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}


export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await request.json()


    const result = companySchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const data = convertEmptyStringsToUndefined(result.data)

    // Auto-inject userId (user doesn't need to provide it)
    const company = await prisma.company.create({
      data: {
        ...data,
        userId: (user as { id: string }).id,
      },
    })

    // Log audit trail for CREATE action
    await logCreate({
      entity: 'company',
      entityId: company.id,
      userId: user.id,
      userEmail: user.email,
      after: company,
      description: `Created company ${company.name}`,
      request,
    })

    return successResponse(company, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
