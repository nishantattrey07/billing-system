/**
 * Quotation Number Utilities
 * Handles financial year detection and quotation numbering
 */

/**
 * Get current financial year in Indian format
 * Financial year runs from April 1 to March 31
 * Returns format: "2024-25"
 */
export function getCurrentFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed (0 = January, 3 = April)

  // If current month is April (3) or later, FY is current year to next year
  // If current month is before April, FY is previous year to current year
  if (month >= 3) {
    // April onwards: 2024-25
    const startYear = year
    const endYear = (year + 1) % 100 // Get last 2 digits
    return `${startYear}-${endYear.toString().padStart(2, '0')}`
  } else {
    // January to March: 2023-24
    const startYear = year - 1
    const endYear = year % 100 // Get last 2 digits
    return `${startYear}-${endYear.toString().padStart(2, '0')}`
  }
}

/**
 * Parse financial year string to get start and end years
 * Input: "2024-25"
 * Output: { startYear: 2024, endYear: 2025 }
 */
export function parseFinancialYear(financialYear: string): {
  startYear: number
  endYear: number
} {
  const match = financialYear.match(/^(\d{4})-(\d{2})$/)
  if (!match) {
    throw new Error('Invalid financial year format. Expected format: 2024-25')
  }

  const startYear = parseInt(match[1], 10)
  const endYearShort = parseInt(match[2], 10)
  const century = Math.floor(startYear / 100) * 100
  const endYear = century + endYearShort

  return { startYear, endYear }
}

/**
 * Get financial year for a specific date
 */
export function getFinancialYearForDate(date: Date): string {
  return getCurrentFinancialYear(date)
}

/**
 * Check if a date falls within a financial year
 */
export function isDateInFinancialYear(date: Date, financialYear: string): boolean {
  const { startYear, endYear } = parseFinancialYear(financialYear)

  // Financial year starts April 1 and ends March 31
  const fyStart = new Date(startYear, 3, 1) // April 1, startYear
  const fyEnd = new Date(endYear, 2, 31, 23, 59, 59) // March 31, endYear

  return date >= fyStart && date <= fyEnd
}

/**
 * Format quotation number suggestion
 * This is just a suggestion - user can edit it
 * Format can be customized based on user preference
 */
export function formatQuotationNumber(sequenceNumber: number): string {
  return `Q.no: ${sequenceNumber}`
}

/**
 * Parse quotation number to extract sequence if it follows standard format
 * Returns null if format doesn't match
 */
export function parseQuotationNumber(quotationNumber: string): number | null {
  const match = quotationNumber.match(/Q\.no:\s*(\d+)/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return null
}
