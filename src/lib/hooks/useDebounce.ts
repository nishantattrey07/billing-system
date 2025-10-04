import { useEffect, useState } from 'react'

/**
 * Debounce a value - delays updating the value until after the specified delay
 * Useful for search inputs to avoid excessive API calls
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 *
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 500)
 *
 * useEffect(() => {
 *   // This will only run 500ms after user stops typing
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
