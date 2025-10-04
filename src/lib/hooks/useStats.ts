import { useStore } from '@/lib/store/useStore'
import { useQuery } from '@tanstack/react-query'

export interface Stats {
  quotations: {
    total: number
    draft: number
    sent: number
  }
  challans: {
    total: number
    draft: number
    sent: number
  }
  invoices: {
    total: number
    draft: number
    paid: number
    unpaid: number
  }
}

export function useStats() {
  const { selectedCompanyId } = useStore()

  return useQuery<Stats>({
    queryKey: ['stats', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) {
        throw new Error('No company selected')
      }

      const params = new URLSearchParams()
      params.set('companyId', selectedCompanyId)

      const res = await fetch(`/api/stats?${params}`)
      if (!res.ok) throw new Error('Failed to fetch stats')

      const result = await res.json()
      return result.data
    },
    enabled: !!selectedCompanyId, // Only fetch if company is selected
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  })
}
