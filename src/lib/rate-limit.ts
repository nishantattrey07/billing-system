/**
 * Simple in-memory rate limiter
 * No external dependencies (Redis, etc.)
 * Perfect for small applications with limited users
 */

interface RateLimitRecord {
  count: number
  resetTime: number
  attempts: number[] // Track attempt timestamps for lockout
}

// Store rate limit records in memory
const requests = new Map<string, RateLimitRecord>()

// Store locked out identifiers
const lockouts = new Map<string, number>()

/**
 * Check if a request should be rate limited
 * @param identifier - Usually IP address or email
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds (default: 5 minutes)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  const now = Date.now()

  // Check if identifier is locked out
  const lockUntil = lockouts.get(identifier)
  if (lockUntil && now < lockUntil) {
    return false // Still locked out
  }

  // Remove expired lockout
  if (lockUntil) {
    lockouts.delete(identifier)
  }

  // Get or create rate limit record
  const record = requests.get(identifier)

  if (!record || now > record.resetTime) {
    // New window or expired window
    requests.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
      attempts: [now],
    })
    return true // Allow request
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return false // Rate limited
  }

  // Increment count and record attempt
  record.count++
  record.attempts.push(now)
  return true // Allow request
}

/**
 * Record a failed login attempt and potentially lock the account
 * @param identifier - Email or IP address
 * @param maxAttempts - Maximum failed attempts before lockout (default: 10)
 * @param lockoutDuration - Lockout duration in milliseconds (default: 15 minutes)
 */
export function recordFailedAttempt(
  identifier: string,
  maxAttempts: number = 10,
  lockoutDuration: number = 15 * 60 * 1000 // 15 minutes
): void {
  const now = Date.now()
  const record = requests.get(identifier)

  if (!record) {
    requests.set(identifier, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 hour window for failed attempts
      attempts: [now],
    })
    return
  }

  // Filter attempts within the last hour
  const recentAttempts = record.attempts.filter(
    (timestamp) => now - timestamp < 60 * 60 * 1000
  )

  recentAttempts.push(now)

  // Update record
  record.attempts = recentAttempts
  record.count = recentAttempts.length

  // Check if should lock out
  if (recentAttempts.length >= maxAttempts) {
    lockouts.set(identifier, now + lockoutDuration)
    console.warn(`[Rate Limit] Locked out ${identifier} for ${lockoutDuration / 60000} minutes`)
  }
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 * @param identifier - Email or IP address
 */
export function resetRateLimit(identifier: string): void {
  requests.delete(identifier)
  lockouts.delete(identifier)
}

/**
 * Check if an identifier is currently locked out
 * @param identifier - Email or IP address
 * @returns true if locked out, false otherwise
 */
export function isLockedOut(identifier: string): boolean {
  const lockUntil = lockouts.get(identifier)
  if (!lockUntil) return false

  const now = Date.now()
  if (now >= lockUntil) {
    lockouts.delete(identifier)
    return false
  }

  return true
}

/**
 * Get remaining lockout time in milliseconds
 * @param identifier - Email or IP address
 * @returns Remaining time in milliseconds, or 0 if not locked out
 */
export function getRemainingLockoutTime(identifier: string): number {
  const lockUntil = lockouts.get(identifier)
  if (!lockUntil) return 0

  const now = Date.now()
  const remaining = lockUntil - now

  return remaining > 0 ? remaining : 0
}

/**
 * Cleanup expired entries (run periodically)
 * Should be called from a background task or on each request
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()

  // Cleanup expired rate limit records
  for (const [identifier, record] of requests.entries()) {
    if (now > record.resetTime) {
      requests.delete(identifier)
    }
  }

  // Cleanup expired lockouts
  for (const [identifier, lockUntil] of lockouts.entries()) {
    if (now >= lockUntil) {
      lockouts.delete(identifier)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  // Only run on server-side
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}
