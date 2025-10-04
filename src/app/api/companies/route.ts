import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validation/schemas/company.schema'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { parsePaginationParams, processCursorPagination } from '@/lib/api/cursor-pagination'
import { convertEmptyStringsToUndefined } from '@/lib/api/transform-data'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { cursor, limit = 20, search } = parsePaginationParams(searchParams)


    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { gstin: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    
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
    const body = await request.json()

    
    const result = companySchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const data = convertEmptyStringsToUndefined(result.data)


    const company = await prisma.company.create({
      data,
    })

    return successResponse(company, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
