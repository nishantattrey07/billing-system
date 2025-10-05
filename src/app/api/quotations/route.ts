import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { quotationSchema } from '@/lib/validation/schemas/quotation.schema'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { parsePaginationParams, processCursorPagination } from '@/lib/api/cursor-pagination'
import { requireAuth } from '@/lib/api/auth'
import { recalculateQuotationAmounts } from '@/lib/utils/quotation-calculations'
import { getCurrentFinancialYear } from '@/lib/utils/quotation-number'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const { cursor, limit = 20, search } = parsePaginationParams(searchParams)

    // Additional filters
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')

    // Build where clause with proper Prisma types
    const where: Prisma.QuotationWhereInput = {}

    if (companyId) {
      where.companyId = companyId
    }

    if (status) {
      where.status = status as Prisma.EnumDocumentStatusFilter
    }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' as const } },
        { subject: { contains: search, mode: 'insensitive' as const } },
        { customerName: { contains: search, mode: 'insensitive' as const } },
        { customerGstin: { contains: search, mode: 'insensitive' as const } },
        { items: { some: { name: { contains: search, mode: 'insensitive' as const } } } },
        { items: { some: { remarks: { contains: search, mode: 'insensitive' as const } } } },
      ]
    }

    const quotations = await prisma.quotation.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstin: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            gstin: true,
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    const result = processCursorPagination(quotations, limit)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { error } = await requireAuth()
    if (error) return error

    const body = await request.json()

    // Validate input
    const result = quotationSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const data = result.data

    // Get company and customer for state information and default terms
    const [company, customer] = await Promise.all([
      prisma.company.findUnique({
        where: { id: data.companyId },
        select: { state: true, defaultTerms: true },
      }),
      prisma.customer.findUnique({
        where: { id: data.customerId },
        select: { state: true },
      }),
    ])

    if (!company) {
      return handleApiError(new Error('Company not found'))
    }

    if (!customer) {
      return handleApiError(new Error('Customer not found'))
    }

    // Calculate all amounts server-side
    const calculations = recalculateQuotationAmounts(
      data.items,
      data.freightCharges,
      company.state || '',
      customer.state || data.customerState || ''
    )

    // Auto-set financial year if not provided
    const financialYear = data.financialYear || getCurrentFinancialYear()

    // Create quotation with items in a transaction
    const quotation = await prisma.$transaction(async (tx) => {
      const newQuotation = await tx.quotation.create({
        data: {
          number: data.number,
          date: data.date,
          subject: data.subject,
          companyId: data.companyId,
          customerId: data.customerId,
          customerName: data.customerName,
          customerGstin: data.customerGstin || null,
          customerAddress: data.customerAddress || null,
          customerCity: data.customerCity || null,
          customerState: data.customerState || null,
          financialYear,
          freightCharges: calculations.freightCharges,
          subtotal: calculations.subtotal,
          cgst: calculations.cgst,
          sgst: calculations.sgst,
          igst: calculations.igst,
          total: calculations.total,
          terms: data.terms || company.defaultTerms || null,
          validUntil: data.validUntil || null,
          isPopulatedByAI: data.isPopulatedByAI,
          status: 'DRAFT',
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              gstin: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              gstin: true,
            },
          },
        },
      })

      // Create items
      await tx.quotationItem.createMany({
        data: calculations.items.map((item) => ({
          quotationId: newQuotation.id,
          name: item.name,
          remarks: item.remarks || null,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          amount: item.amount,
          sortOrder: item.sortOrder,
        })),
      })

      // Fetch items to include in response
      const items = await tx.quotationItem.findMany({
        where: { quotationId: newQuotation.id },
        orderBy: { sortOrder: 'asc' },
      })

      return {
        ...newQuotation,
        items,
      }
    })

    return successResponse(quotation, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
