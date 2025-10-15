/**
 * Quotation Calculation Utilities
 * Shared between frontend and backend for consistent calculations
 */

interface QuotationItem {
  name: string
  remarks?: string
  quantity: number
  unit: string
  unitPrice: number
  discount?: number
  amount?: number
  sortOrder?: number
}

interface GSTResult {
  sgst: number
  cgst: number
  igst: number
}

/**
 * Calculate item amount with optional discount
 * Formula: (quantity × unitPrice) × (1 - discount/100)
 * Rounds to 3 decimal places
 */
export function calculateItemAmount(
  quantity: number,
  unitPrice: number,
  discount: number = 0
): number {
  if (quantity <= 0 || unitPrice < 0) {
    throw new Error('Invalid quantity or unit price')
  }
  if (discount < 0 || discount > 100) {
    throw new Error('Discount must be between 0 and 100')
  }

  const discountMultiplier = 1 - discount / 100
  const amount = quantity * unitPrice * discountMultiplier

  return Number(amount.toFixed(3))
}

/**
 * Calculate subtotal from array of items
 * Sums all item amounts
 */
export function calculateSubtotal(items: QuotationItem[]): number {
  const subtotal = items.reduce((sum, item) => {
    const itemAmount = item.amount ?? calculateItemAmount(
      item.quantity,
      item.unitPrice,
      item.discount
    )
    return sum + itemAmount
  }, 0)

  return Number(subtotal.toFixed(3))
}

/**
 * Calculate GST based on company and customer states
 *
 * IMPORTANT: As per Indian GST regulations, GST is calculated on the taxable amount
 * which includes BOTH the subtotal AND freight charges (if any).
 *
 * Same state (intra-state): SGST 9% + CGST 9% = 18%
 * Different state (inter-state): IGST 18%
 *
 * @param taxableAmount - Subtotal + Freight charges (the base amount on which GST is calculated)
 * @param companyState - State of the company (seller)
 * @param customerState - State of the customer (buyer)
 * @returns Object with sgst, cgst, and igst amounts (with 3 decimal places)
 */
export function calculateGST(
  taxableAmount: number,
  companyState: string,
  customerState: string
): GSTResult {
  if (taxableAmount < 0) {
    throw new Error('Taxable amount cannot be negative')
  }

  // Normalize state names for comparison (trim and lowercase)
  const normalizedCompanyState = companyState?.trim().toLowerCase() || ''
  const normalizedCustomerState = customerState?.trim().toLowerCase() || ''

  const isSameState = normalizedCompanyState === normalizedCustomerState && normalizedCompanyState !== ''

  if (isSameState) {
    // Intra-state: SGST + CGST (9% each)
    const sgst = Number((taxableAmount * 0.09).toFixed(3))
    const cgst = Number((taxableAmount * 0.09).toFixed(3))

    return {
      sgst,
      cgst,
      igst: 0,
    }
  } else {
    // Inter-state: IGST (18%)
    const igst = Number((taxableAmount * 0.18).toFixed(3))

    return {
      sgst: 0,
      cgst: 0,
      igst,
    }
  }
}

/**
 * Calculate final total
 * Sums: subtotal + freight + sgst + cgst + igst
 * Rounds to 2 decimal places (Indian standard)
 */
export function calculateTotal(
  subtotal: number,
  freightCharges: number,
  gst: GSTResult
): number {
  const total = subtotal + freightCharges + gst.sgst + gst.cgst + gst.igst

  return Number(total.toFixed(2))
}

/**
 * Format number as Indian currency
 * Returns: "₹11,684.00"
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Convert number to words in Indian format
 * Handles rupees and paise
 * Returns: "Rupees Thirteen Thousand Seven Hundred Eighty-Seven and Twelve Paise Only"
 */
export function numberToWords(amount: number): string {
  if (amount < 0) {
    throw new Error('Amount cannot be negative')
  }

  // Split into rupees and paise
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)

  // Helper arrays for conversion
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ]

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ]

  /**
   * Convert number less than 100 to words
   */
  function convertTens(num: number): string {
    if (num < 20) {
      return ones[num]
    }
    const ten = Math.floor(num / 10)
    const one = num % 10
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '')
  }

  /**
   * Convert number less than 1000 to words
   */
  function convertHundreds(num: number): string {
    if (num === 0) return ''
    if (num < 100) return convertTens(num)

    const hundred = Math.floor(num / 100)
    const remainder = num % 100

    let result = ones[hundred] + ' Hundred'
    if (remainder > 0) {
      result += ' ' + convertTens(remainder)
    }
    return result
  }

  /**
   * Convert full number to Indian words format
   */
  function convertToIndianWords(num: number): string {
    if (num === 0) return 'Zero'

    // Indian numbering system: Ones, Tens, Hundreds, Thousands, Lakhs, Crores
    const crores = Math.floor(num / 10000000)
    const lakhs = Math.floor((num % 10000000) / 100000)
    const thousands = Math.floor((num % 100000) / 1000)
    const hundreds = num % 1000

    let words = ''

    if (crores > 0) {
      words += convertHundreds(crores) + ' Crore '
    }
    if (lakhs > 0) {
      words += convertHundreds(lakhs) + ' Lakh '
    }
    if (thousands > 0) {
      words += convertHundreds(thousands) + ' Thousand '
    }
    if (hundreds > 0) {
      words += convertHundreds(hundreds)
    }

    return words.trim()
  }

  // Build final string
  let result = 'Rupees ' + convertToIndianWords(rupees)

  if (paise > 0) {
    result += ' and ' + convertToIndianWords(paise) + ' Paise'
  }

  result += ' Only'

  return result
}

/**
 * Recalculate all amounts for a quotation
 * Used to ensure consistency after edits
 *
 * IMPORTANT: GST is calculated on (subtotal + freightCharges) as per Indian GST law
 */
export function recalculateQuotationAmounts(
  items: QuotationItem[],
  freightCharges: number,
  companyState: string,
  customerState: string
) {
  // Calculate item amounts
  const itemsWithAmounts = items.map((item, index) => ({
    ...item,
    amount: calculateItemAmount(item.quantity, item.unitPrice, item.discount || 0),
    sortOrder: item.sortOrder ?? index,
  }))

  // Calculate subtotal
  const subtotal = calculateSubtotal(itemsWithAmounts)

  // Calculate taxable amount (subtotal + freight) - GST is applied on this
  const taxableAmount = subtotal + freightCharges

  // Calculate GST on taxable amount (subtotal + freight)
  const gst = calculateGST(taxableAmount, companyState, customerState)

  // Calculate total
  const total = calculateTotal(subtotal, freightCharges, gst)

  return {
    items: itemsWithAmounts,
    subtotal,
    freightCharges,
    sgst: gst.sgst,
    cgst: gst.cgst,
    igst: gst.igst,
    total,
  }
}
