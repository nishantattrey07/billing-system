import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Auth middleware - Verifies user is authenticated
 * Returns user object if authenticated, null if not
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient() // createClient is async
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Requires authentication - Returns 401 response if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      ),
    }
  }

  return { user, error: null }
}
