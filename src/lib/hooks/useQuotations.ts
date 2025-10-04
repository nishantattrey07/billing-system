/**
 * TanStack Query Hooks for Quotations
 * Handles data fetching, mutations, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QuotationInput } from '@/lib/validation/schemas/quotation.schema'

// API client functions
const quotationApi = {
  /**
   * Fetch paginated list of quotations
   */
  async getQuotations(params?: {
    cursor?: string
    limit?: number
    search?: string
    companyId?: string
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.companyId) searchParams.set('companyId', params.companyId)
    if (params?.status) searchParams.set('status', params.status)

    const response = await fetch(`/api/quotations?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch quotations')
    }
    return response.json()
  },

  /**
   * Fetch single quotation by ID
   */
  async getQuotation(id: string) {
    const response = await fetch(`/api/quotations/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch quotation')
    }
    return response.json()
  },

  /**
   * Create new quotation
   */
  async createQuotation(data: QuotationInput) {
    const response = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create quotation')
    }
    return response.json()
  },

  /**
   * Update existing quotation
   */
  async updateQuotation(id: string, data: Partial<QuotationInput>) {
    const response = await fetch(`/api/quotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update quotation')
    }
    return response.json()
  },

  /**
   * Delete quotation
   */
  async deleteQuotation(id: string) {
    const response = await fetch(`/api/quotations/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete quotation')
    }
    return response.json()
  },

  /**
   * Recalculate quotation amounts
   */
  async recalculateQuotation(id: string) {
    const response = await fetch(`/api/quotations/${id}/recalculate`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to recalculate quotation')
    }
    return response.json()
  },
}

// Query keys factory
export const quotationKeys = {
  all: ['quotations'] as const,
  lists: () => [...quotationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...quotationKeys.lists(), filters] as const,
  details: () => [...quotationKeys.all, 'detail'] as const,
  detail: (id: string) => [...quotationKeys.details(), id] as const,
}

/**
 * Hook to fetch paginated quotations list
 */
export function useQuotations(params?: {
  cursor?: string
  limit?: number
  search?: string
  companyId?: string
  status?: string
}) {
  return useQuery({
    queryKey: quotationKeys.list(params || {}),
    queryFn: () => quotationApi.getQuotations(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch single quotation
 */
export function useQuotation(id: string | undefined) {
  return useQuery({
    queryKey: quotationKeys.detail(id!),
    queryFn: () => quotationApi.getQuotation(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to create quotation with optimistic update
 */
export function useCreateQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: quotationApi.createQuotation,
    onSuccess: () => {
      // Invalidate all quotation lists
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

/**
 * Hook to update quotation with optimistic update
 */
export function useUpdateQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuotationInput> }) =>
      quotationApi.updateQuotation(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: quotationKeys.detail(id) })

      // Snapshot previous value
      const previousQuotation = queryClient.getQueryData(quotationKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(quotationKeys.detail(id), (old: unknown) => ({
        ...(old as Record<string, unknown>),
        ...data,
      }))

      return { previousQuotation }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousQuotation) {
        queryClient.setQueryData(quotationKeys.detail(id), context.previousQuotation)
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

/**
 * Hook to delete quotation
 */
export function useDeleteQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: quotationApi.deleteQuotation,
    onSuccess: () => {
      // Invalidate all quotation queries
      queryClient.invalidateQueries({ queryKey: quotationKeys.all })
    },
  })
}

/**
 * Hook to recalculate quotation amounts
 */
export function useRecalculateQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: quotationApi.recalculateQuotation,
    onSuccess: (data, id) => {
      // Update cache with recalculated data
      queryClient.setQueryData(quotationKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}
