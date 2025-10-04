import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Customer } from '@/generated/prisma'
import { CustomerInput } from '@/lib/validation/schemas/customer.schema'

interface CustomersResponse {
  data: Customer[]
  nextCursor: string | null
  hasMore: boolean
}


export function useCustomers(search?: string) {
  return useInfiniteQuery<CustomersResponse>({
    queryKey: ['customers', search],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set('cursor', pageParam as string)
      if (search) params.set('search', search)

      const res = await fetch(`/api/customers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch customers')

      const result = await res.json()
      return result.data
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}


export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${id}`)
      if (!res.ok) throw new Error('Failed to fetch customer')

      const result = await res.json()
      return result.data
    },
    enabled: !!id,
  })
}


export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CustomerInput) => {
      const res = await fetch('/api/customers', {
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
    onSuccess: () => {
      // Invalidate in background (non-blocking)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    // No retry for creates - fail fast
    retry: false,
  })
}


export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerInput> }) => {
      const res = await fetch(`/api/customers/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    retry: false,
  })
}
