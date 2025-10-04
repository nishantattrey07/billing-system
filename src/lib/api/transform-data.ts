/**
 * Convert empty strings to undefined for database storage
 * This ensures optional fields are stored as NULL instead of empty strings
 */
export function convertEmptyStringsToUndefined<T extends Record<string, unknown>>(
  data: T
): T {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === '' ? undefined : value,
    ])
  ) as T
}
