import { QuotationCreationLayout } from '@/components/quotations/QuotationCreationLayout'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import { QuotationCreationSkeleton } from '@/components/quotations/QuotationCreationSkeleton'

// Fetch quotation and related data
async function getQuotationData(quotationId: string, userId: string) {
  try {
    // Fetch the quotation with all related data
    const quotation = await prisma.quotation.findFirst({
      where: {
        id: quotationId,
        company: {
          userId, // Ensure user owns this quotation through company
        },
      },
      include: {
        company: true,
        customer: true,
        items: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (!quotation) {
      return null
    }

    // Fetch companies for dropdown
    const companies = await prisma.company.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        gstin: true,
        address: true,
        phone: true,
        state: true,
        defaultTerms: true,
      },
      orderBy: { name: 'asc' },
      take: 100,
    })

    // Fetch customers for dropdown
    const customers = await prisma.customer.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        gstin: true,
        address: true,
        city: true,
        state: true,
      },
      orderBy: { name: 'asc' },
      take: 100,
    })

    return {
      quotation,
      companies,
      customers,
    }
  } catch (error) {
    console.error('Failed to fetch quotation data:', error)
    return null
  }
}

export default async function EditQuotationPage({
  params,
}: {
  params: { id: string }
}) {
  // Server-side authentication check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get quotation data
  const data = await getQuotationData(params.id, user.id)

  if (!data) {
    notFound()
  }

  const { quotation, companies, customers } = data

  return (
    <Suspense fallback={<QuotationCreationSkeleton />}>
      <QuotationCreationLayout
        initialCompanies={companies}
        initialCustomers={customers}
        selectedCompany={quotation.company}
        existingQuotation={{
          id: quotation.id,
          number: quotation.number,
          date: quotation.date,
          subject: quotation.subject,
          financialYear: quotation.financialYear,
          companyId: quotation.companyId,
          companyName: quotation.company.name,
          companyGstin: quotation.company.gstin,
          companyAddress: quotation.company.address,
          companyPhone: quotation.company.phone,
          companyState: quotation.company.state,
          customerId: quotation.customerId,
          customerName: quotation.customer.name,
          customerGstin: quotation.customer.gstin,
          customerAddress: quotation.customer.address,
          customerCity: quotation.customer.city,
          customerState: quotation.customer.state,
          items: quotation.items.map((item) => ({
            id: item.id,
            name: item.name,
            remarks: item.remarks || '',
            quantity: Number(item.quantity),
            unit: item.unit,
            unitPrice: Number(item.unitPrice),
            discount: Number(item.discount),
            amount: Number(item.amount),
            sortOrder: item.sortOrder,
          })),
          freightCharges: Number(quotation.freightCharges),
          termsAndConditions: quotation.terms || '',
          status: quotation.status,
        }}
      />
    </Suspense>
  )
}
