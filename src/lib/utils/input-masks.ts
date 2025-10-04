/**
 * Input masking and formatting utilities for Indian business data
 */

/**
 * Format GSTIN: 22AAAAA0000A1Z5 → 22-AAAAA-0000-A1Z5
 */
export function formatGSTIN(value: string): string {
  const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase()

  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
  if (cleaned.length <= 11) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}-${cleaned.slice(11, 15)}`
}

/**
 * Unmask GSTIN: 22-AAAAA-0000-A1Z5 → 22AAAAA0000A1Z5
 */
export function unformatGSTIN(value: string): string {
  return value.replace(/[^A-Z0-9]/g, '').toUpperCase()
}

/**
 * Format PAN: ABCDE1234F (no masking, just uppercase)
 */
export function formatPAN(value: string): string {
  return value.replace(/[^A-Z0-9]/g, '').toUpperCase().slice(0, 10)
}


/**
 * Format pincode: 123456 (no masking)
 */
export function formatPincode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

/**
 * Format IFSC: SBIN0001234 (uppercase only)
 */
export function formatIFSC(value: string): string {
  return value.replace(/[^A-Z0-9]/g, '').toUpperCase().slice(0, 11)
}

/**
 * Auto-uppercase for specific fields
 */
export function autoUppercase(value: string): string {
  return value.toUpperCase()
}

/**
 * Extract state code from GSTIN (first 2 digits)
 */
export function extractStateFromGSTIN(gstin: string): string {
  const stateCode = gstin.slice(0, 2)
  const stateMap: Record<string, string> = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli and Daman and Diu',
    '27': 'Maharashtra',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
  }

  return stateMap[stateCode] || ''
}
