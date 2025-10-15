import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, recordFailedAttempt, isLockedOut, getRemainingLockoutTime } from '@/lib/rate-limit'

/**
 * POST /api/auth/check-rate-limit
 * Check if login attempt is rate limited
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { allowed: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get IP address
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const identifier = `${ip}-${email}`

    // Check if locked out
    if (isLockedOut(identifier)) {
      const remainingTime = getRemainingLockoutTime(identifier)
      const remainingMinutes = Math.ceil(remainingTime / 60000)

      return NextResponse.json({
        allowed: false,
        locked: true,
        message: `Too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
        remainingTime,
      })
    }

    // Check rate limit (5 attempts per 5 minutes)
    const allowed = checkRateLimit(identifier, 5, 5 * 60 * 1000)

    if (!allowed) {
      return NextResponse.json({
        allowed: false,
        message: 'Too many login attempts. Please wait a few minutes and try again.',
      })
    }

    return NextResponse.json({
      allowed: true,
    })
  } catch (_error) {
    console.error('[Rate Limit] Error:', _error)
    return NextResponse.json(
      { allowed: true }, // Allow on error to not break login
      { status: 200 }
    )
  }
}

/**
 * PUT /api/auth/check-rate-limit
 * Record failed login attempt
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, success } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const identifier = `${ip}-${email}`

    if (success === false) {
      // Record failed attempt
      recordFailedAttempt(identifier, 10, 15 * 60 * 1000) // Lock after 10 attempts for 15 min
    }

    return NextResponse.json({ success: true })
  } catch (_error) {
    console.error('[Rate Limit] Error:', _error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
