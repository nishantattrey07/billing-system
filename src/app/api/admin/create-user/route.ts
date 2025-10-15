import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/api/auth'
import { isAdmin, generateRandomPassword, isValidEmail } from '@/lib/utils/admin'
import { z } from 'zod'

// Validation schema for user creation
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  generatePassword: z.boolean().default(false),
})

/**
 * POST /api/admin/create-user
 * Admin-only endpoint to create new users
 * Only accessible to nishantattrey07@gmail.com
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    // 2. Verify user is admin
    const userEmail = user?.email
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Only admin can create users.',
        },
        { status: 403 }
      )
    }

    // 3. Parse and validate request body
    const body = await request.json()
    const result = createUserSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: result.error.issues,
        },
        { status: 400 }
      )
    }

    const { email, password, generatePassword } = result.data

    // 4. Validate email format (double check)
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    // 5. Generate password if requested
    const finalPassword = generatePassword ? generateRandomPassword(16) : password

    if (!finalPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password is required. Set generatePassword: true to auto-generate.',
        },
        { status: 400 }
      )
    }

    // 6. Create Supabase admin client (uses service role key)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 7. Create user via admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true, // Auto-confirm email (skip email verification)
    })

    if (error) {
      console.error('[Admin] User creation error:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    // 8. Log the action
    console.log(`[Admin] User created by ${userEmail}: ${email}`)

    // 9. Return success with credentials
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
          credentials: {
            email,
            password: finalPassword,
            message: 'Save these credentials securely. Password will not be shown again.',
          },
        },
      },
      { status: 201 }
    )
  } catch (_error) {
    console.error('[Admin] Unexpected error:', _error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/create-user
 * Check if current user is admin
 */
export async function GET() {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const userEmail = user?.email

    return NextResponse.json({
      success: true,
      isAdmin: isAdmin(userEmail),
      email: userEmail,
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
