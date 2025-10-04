import { DocumentStatus } from '@/generated/prisma'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { requireAuth } from '@/lib/api/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user, error } = await requireAuth(request)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return handleApiError(new Error('Company ID is required'))
    }

    // Fetch all stats in parallel using groupBy for better performance
    // Reduces from 10 queries to 3 queries
    const [quotationStats, challanStats, invoiceStats] = await Promise.all([
      // Quotations grouped by status
      prisma.quotation.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
      }),
      // Challans grouped by status
      prisma.challan.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
      }),
      // Invoices grouped by status
      prisma.invoice.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
      }),
    ])

    // Helper function to extract counts from groupBy results
    const getCount = (stats: Array<{ status: DocumentStatus; _count: { id: number } }>, status: DocumentStatus) => {
      return stats.find((s) => s.status === status)?._count.id || 0
    }

    // Calculate totals and build response
    const quotationTotal = quotationStats.reduce((sum, s) => sum + s._count.id, 0)
    const challanTotal = challanStats.reduce((sum, s) => sum + s._count.id, 0)
    const invoiceTotal = invoiceStats.reduce((sum, s) => sum + s._count.id, 0)

    const stats = {
      quotations: {
        total: quotationTotal,
        draft: getCount(quotationStats, DocumentStatus.DRAFT),
        sent: getCount(quotationStats, DocumentStatus.SENT),
      },
      challans: {
        total: challanTotal,
        draft: getCount(challanStats, DocumentStatus.DRAFT),
        sent: getCount(challanStats, DocumentStatus.SENT),
      },
      invoices: {
        total: invoiceTotal,
        draft: getCount(invoiceStats, DocumentStatus.DRAFT),
        paid: getCount(invoiceStats, DocumentStatus.PAID),
        unpaid: getCount(invoiceStats, DocumentStatus.UNPAID),
      },
    }

    return successResponse(stats)
  } catch (error) {
    return handleApiError(error)
  }
}
