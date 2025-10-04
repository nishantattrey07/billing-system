import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@/generated/prisma'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        fields: error.issues.map((err) => ({
          path: err.path.join('.'),
          code: err.code,
          message: err.message,
        })),
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.[0] || 'field'
      return NextResponse.json(
        {
          success: false,
          error: 'duplicate_error',
          field,
          message: `${field} already exists`,
        },
        { status: 409 }
      )
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'not_found',
          message: 'Record not found',
        },
        { status: 404 }
      )
    }
  }

  // Generic server error
  return NextResponse.json(
    {
      success: false,
      error: 'server_error',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}
