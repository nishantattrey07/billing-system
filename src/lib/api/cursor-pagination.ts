export interface CursorPaginationParams {
  cursor?: string | null
  limit?: number
  search?: string
}

export interface CursorPaginationResult<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export function processCursorPagination<T extends { id: string }>(
  items: T[],
  limit: number
): CursorPaginationResult<T> {
  const hasMore = items.length > limit
  const data = hasMore ? items.slice(0, limit) : items
  const nextCursor = hasMore ? data[data.length - 1].id : null

  return {
    data,
    nextCursor,
    hasMore,
  }
}

export function parsePaginationParams(searchParams: URLSearchParams): CursorPaginationParams {
  return {
    cursor: searchParams.get('cursor') || undefined,
    limit: parseInt(searchParams.get('limit') || '20', 10),
    search: searchParams.get('search') || '',
  }
}
