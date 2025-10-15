import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { quotationSchema } from '@/lib/validation/schemas/quotation.schema'
import { handleApiError, successResponse } from '@/lib/api/error-handler'
import { requireAuth } from '@/lib/api/auth'
import { recalculateQuotationAmounts } from '@/lib/utils/quotation-calculations'
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

    const quotation = await prisma.quotation.findUnique({
      where: {
        id,
        deletedAt: null, // Only fetch non-deleted quotations
      },
      include: {
        company: true,
        customer: true,
        items: {
          where: { deletedAt: null }, // Only fetch non-deleted items
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!quotation) {
      return handleApiError(new Error('Quotation not found'))
    }

    return successResponse(quotation)
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

    // Validate input
    const result = quotationSchema.partial().safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const data = result.data

    // Fetch existing quotation
    const existing = await prisma.quotation.findUnique({
      where: {
        id,
        deletedAt: null, // Cannot update deleted quotations
      },
      include: {
        company: true,
        customer: true,
        items: {
          where: { deletedAt: null },
        },
      },
    })

    if (!existing) {
      return handleApiError(new Error('Quotation not found'))
    }

    // Determine company and customer states
    const companyState = existing.company.state || ''
    let customerState = existing.customerState || existing.customer?.state || ''

    // If customer changed, fetch new customer state
    if (data.customerId && data.customerId !== existing.customerId) {
      const newCustomer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        select: { state: true },
      })
      if (newCustomer) {
        customerState = newCustomer.state || data.customerState || ''
      }
    }

    // If customer state is being updated directly
    if (data.customerState) {
      customerState = data.customerState
    }

    // Determine amounts to use (recalculate if items/freight changed)
    let amountsToUse = {
      subtotal: Number(existing.subtotal),
      freightCharges: Number(existing.freightCharges),
      sgst: Number(existing.sgst),
      cgst: Number(existing.cgst),
      igst: Number(existing.igst),
      total: Number(existing.total),
    }

    let calculatedItems: ReturnType<typeof recalculateQuotationAmounts>['items'] | undefined

    if (data.items || data.freightCharges !== undefined) {
      const itemsToCalculate = data.items || existing.items.map((item) => ({
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        name: item.name,
        remarks: item.remarks || undefined,
        unit: item.unit,
      }))

      const freightToUse = data.freightCharges !== undefined
        ? data.freightCharges
        : Number(existing.freightCharges)

      const calculations = recalculateQuotationAmounts(
        itemsToCalculate,
        freightToUse,
        companyState,
        customerState
      )

      amountsToUse = {
        subtotal: calculations.subtotal,
        freightCharges: calculations.freightCharges,
        sgst: calculations.sgst,
        cgst: calculations.cgst,
        igst: calculations.igst,
        total: calculations.total,
      }

      calculatedItems = calculations.items
    }

    // Update quotation with items in a transaction
    const quotation = await prisma.$transaction(async (tx) => {
      // Update quotation
      const updated = await tx.quotation.update({
        where: { id },
        data: {
          number: data.number,
          date: data.date,
          subject: data.subject,
          customerId: data.customerId,
          customerName: data.customerName,
          customerGstin: data.customerGstin,
          customerAddress: data.customerAddress,
          customerCity: data.customerCity,
          customerState: data.customerState,
          freightCharges: amountsToUse.freightCharges,
          subtotal: amountsToUse.subtotal,
          cgst: amountsToUse.cgst,
          sgst: amountsToUse.sgst,
          igst: amountsToUse.igst,
          total: amountsToUse.total,
          terms: data.terms,
          validUntil: data.validUntil,
          status: data.status, // Allow status updates
          updatedBy: user!.id, // Audit trail
        },
        include: {
          company: true,
          customer: true,
        },
      })

      // If items were recalculated, replace all items
      if (calculatedItems) {
        // Delete existing items
        await tx.quotationItem.deleteMany({
          where: { quotationId: id },
        })

        // Create new items
        await tx.quotationItem.createMany({
          data: calculatedItems.map((item) => ({
            quotationId: id,
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
      }

      // Fetch items to include in response
      const items = await tx.quotationItem.findMany({
        where: {
          quotationId: id,
          deletedAt: null,
        },
        orderBy: { sortOrder: 'asc' },
      })

      return {
        ...updated,
        items,
      }
    })

    // Log audit trail for UPDATE action
    await logUpdate({
      entity: 'quotation',
      entityId: id,
      userId: user!.id,
      userEmail: user!.email,
      before: existing,
      after: quotation,
      description: `Updated quotation ${quotation.number}`,
      request,
    })

    return successResponse(quotation)
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

    // Check if quotation exists and is not already deleted
    const existing = await prisma.quotation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return handleApiError(new Error('Quotation not found'))
    }

    // Soft delete quotation (mark as deleted instead of removing)
    await prisma.quotation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: user!.id,
      },
    })

    // Log audit trail for DELETE action
    await logDelete({
      entity: 'quotation',
      entityId: id,
      userId: user!.id,
      userEmail: user!.email,
      before: existing,
      description: `Deleted quotation ${existing.number}`,
      request,
    })

    return successResponse({ message: 'Quotation deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
