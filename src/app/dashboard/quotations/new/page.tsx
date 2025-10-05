import { QuotationCreationLayout } from '@/components/quotations/QuotationCreationLayout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import { QuotationCreationSkeleton } from '@/components/quotations/QuotationCreationSkeleton'

// Fetch initial data on server
async function getInitialData(userId: string) {
  try {
    // Fetch companies for the user
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

    // Fetch recent customers for dropdown
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

    // Use first company as default
    const selectedCompany = companies[0] || null

    return {
      companies,
      customers,
      selectedCompany,
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
    return {
      companies: [],
      customers: [],
      selectedCompany: null,
    }
  }
}

export default async function NewQuotationPage() {
  // Server-side authentication check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get initial data
  const initialData = await getInitialData(user.id)

  return (
    <Suspense fallback={<QuotationCreationSkeleton />}>
      <QuotationCreationLayout
        initialCompanies={initialData.companies}
        initialCustomers={initialData.customers}
        selectedCompany={initialData.selectedCompany}
      />
    </Suspense>
  )
}
