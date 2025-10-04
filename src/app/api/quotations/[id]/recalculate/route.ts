import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { requireAuth } from '@/lib/api/auth'
import { recalculateQuotationAmounts } from '@/lib/utils/quotation-calculations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params

    // Fetch quotation with all items and related data
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        company: {
          select: { state: true },
        },
        customer: {
          select: { state: true },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!quotation) {
      return handleApiError(new Error('Quotation not found'))
    }

    // Prepare items for recalculation
    const items = quotation.items.map((item) => ({
      name: item.name,
      remarks: item.remarks || undefined,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount || 0),
      sortOrder: item.sortOrder,
    }))

    // Recalculate all amounts
    const calculations = recalculateQuotationAmounts(
      items,
      Number(quotation.freightCharges),
      quotation.company.state || quotation.customerState || '',
      quotation.customer?.state || quotation.customerState || ''
    )

    // Update quotation and items in transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Update quotation amounts
      const updatedQuotation = await tx.quotation.update({
        where: { id },
        data: {
          subtotal: calculations.subtotal,
          cgst: calculations.cgst,
          sgst: calculations.sgst,
          igst: calculations.igst,
          total: calculations.total,
        },
        include: {
          company: true,
          customer: true,
        },
      })

      // Update each item's amount
      for (let i = 0; i < calculations.items.length; i++) {
        const item = calculations.items[i]
        const existingItem = quotation.items[i]

        if (existingItem) {
          await tx.quotationItem.update({
            where: { id: existingItem.id },
            data: {
              amount: item.amount,
              sortOrder: item.sortOrder,
            },
          })
        }
      }

      // Fetch updated items
      const updatedItems = await tx.quotationItem.findMany({
        where: { quotationId: id },
        orderBy: { sortOrder: 'asc' },
      })

      return {
        ...updatedQuotation,
        items: updatedItems,
      }
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
