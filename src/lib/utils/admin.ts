/**
 * Admin utilities for user management
 * Only accessible to whitelisted admin emails
 */

// Whitelist of admin emails
const ADMIN_EMAILS = ['nishantattrey07@gmail.com']

/**
 * Check if an email is an admin
 * @param email - Email address to check
 * @returns true if email is in admin whitelist
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Generate a random secure password
 * @param length - Password length (default: 16)
 * @returns Random password string
 */
export function generateRandomPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'

  const all = uppercase + lowercase + numbers + symbols

  let password = ''

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get admin emails list (for display purposes)
 * @returns Array of admin emails
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS]
}
