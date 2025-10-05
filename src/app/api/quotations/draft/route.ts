import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import { recalculateQuotationAmounts } from '@/lib/utils/quotation-calculations'
import { getCurrentFinancialYear } from '@/lib/utils/quotation-number'

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth()
    if (authError) return authError

    const body = await request.json()

    // Validate required fields
    if (!body.companyId || !body.customerName) {
      return NextResponse.json(
        { error: 'Company ID and customer name are required' },
        { status: 400 }
      )
    }

    // Get company for state info
    const company = await prisma.company.findUnique({
      where: { id: body.companyId },
      select: { state: true, defaultTerms: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Calculate amounts server-side
    const calculations = recalculateQuotationAmounts(
      body.items || [],
      body.freightCharges || 0,
      company.state || '',
      body.customerState || ''
    )

    // Save draft
    const quotation = await prisma.$transaction(async (tx) => {
      const draft = await tx.quotation.create({
        data: {
          number: body.number || 'DRAFT',
          date: body.date ? new Date(body.date) : new Date(),
          subject: body.subject || '',
          companyId: body.companyId,
          customerId: body.customerId || '',
          customerName: body.customerName,
          customerGstin: body.customerGstin || null,
          customerAddress: body.customerAddress || null,
          customerCity: body.customerCity || null,
          customerState: body.customerState || null,
          financialYear: body.financialYear || getCurrentFinancialYear(),
          freightCharges: calculations.freightCharges,
          subtotal: calculations.subtotal,
          cgst: calculations.cgst,
          sgst: calculations.sgst,
          igst: calculations.igst,
          total: calculations.total,
          terms: body.terms || company.defaultTerms || null,
          validUntil: body.validUntil ? new Date(body.validUntil) : null,
          status: 'DRAFT',
        },
      })

      // Create items if any
      if (calculations.items.length > 0) {
        await tx.quotationItem.createMany({
          data: calculations.items.map((item) => ({
            quotationId: draft.id,
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

      return draft
    })

    return NextResponse.json(
      {
        success: true,
        quotationId: quotation.id,
        message: 'Draft saved successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Save draft error:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}
