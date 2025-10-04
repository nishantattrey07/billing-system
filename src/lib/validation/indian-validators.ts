// Indian-specific validation patterns

// GSTIN Format: 22AAAAA0000A1Z5
// 2 digits (state code) + 5 letters (PAN) + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

// PAN Format: ABCDE1234F
// 5 letters + 4 digits + 1 letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

// Indian Mobile: 10 digits starting with 6-9
export const PHONE_REGEX = /^[6-9]\d{9}$/

// Pincode: 6 digits
export const PINCODE_REGEX = /^\d{6}$/

// IFSC Code: 4 letters + 7 alphanumeric (e.g., SBIN0001234)
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

/**
 * Extract state code from GSTIN
 */
export function getStateCodeFromGSTIN(gstin: string): string {
  if (!gstin || gstin.length < 2) return ''
  return gstin.substring(0, 2)
}

/**
 * Validate GSTIN format
 */
export function isValidGSTIN(gstin: string): boolean {
  return GSTIN_REGEX.test(gstin)
}

/**
 * Validate PAN format
 */
export function isValidPAN(pan: string): boolean {
  return PAN_REGEX.test(pan)
}

/**
 * Validate Indian phone number
 */
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone)
}

/**
 * Validate Indian pincode
 */
export function isValidPincode(pincode: string): boolean {
  return PINCODE_REGEX.test(pincode)
}

/**
 * Validate IFSC code
 */
export function isValidIFSC(ifsc: string): boolean {
  return IFSC_REGEX.test(ifsc)
}
