import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 400,
    readonly details?: Record<string, unknown>,
  ) {
    super(message)
  }
}

export function apiError(error: unknown) {
  const requestId = randomUUID()
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, requestId, details: error.details } },
      { status: error.status },
    )
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'Request validation failed', requestId } },
      { status: 400 },
    )
  }
  console.error(JSON.stringify({ requestId, code: 'INTERNAL_ERROR' }))
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', requestId } },
    { status: 500 },
  )
}

export function requireJson(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new ApiError('VALIDATION_FAILED', 'Content-Type must be application/json', 415)
  }
}
