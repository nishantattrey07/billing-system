import { Company } from '@/generated/prisma'
import { CompanyInput } from '@/lib/validation/schemas/company.schema'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface CompaniesResponse {
  data: Company[]
  nextCursor: string | null
  hasMore: boolean
}


export function useCompanies(search?: string) {
  return useInfiniteQuery<CompaniesResponse>({
    queryKey: ['companies', search],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set('cursor', pageParam as string)
      if (search) params.set('search', search)

      const res = await fetch(`/api/companies?${params}`)
      if (!res.ok) throw new Error('Failed to fetch companies')

      const result = await res.json()
      return result.data
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}


export function useAllCompanies() {
  return useQuery<Company[]>({
    queryKey: ['companies', 'all'],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('limit', '100') // Get up to 100 companies for dropdown

      const res = await fetch(`/api/companies?${params}`)
      if (!res.ok) throw new Error('Failed to fetch companies')

      const result = await res.json()
      // Extract just the data array from paginated response
      return result.data?.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}


export function useCompany(id: string) {
  return useQuery<Company>({
    queryKey: ['company', id],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${id}`)
      if (!res.ok) throw new Error('Failed to fetch company')

      const result = await res.json()
      return result.data
    },
    enabled: !!id,
  })
}


export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CompanyInput) => {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!result.success) {
        throw result
      }

      return result.data
    },
    onSuccess: (newCompany) => {
      // Optimistic update - add to cache immediately
      queryClient.setQueryData(['companies', 'all'], (oldData: Company[] | undefined) => {
        if (!oldData) return [newCompany]
        return [newCompany, ...oldData]
      })

      // Invalidate in background (non-blocking)
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    // No retry for creates - fail fast
    retry: false,
  })
}


export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyInput> }) => {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!result.success) {
        throw result
      }

      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    retry: false,
  })
}
