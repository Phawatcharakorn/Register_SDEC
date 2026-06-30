import { NextResponse } from 'next/server'
import type { ApiError } from '@/types/api'

/** 200 OK */
export function ok<T extends object>(data: T) {
  return NextResponse.json(data, { status: 200 })
}

/** 201 Created */
export function created<T extends object>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

/** 204 No Content */
export function noContent() {
  return new NextResponse(null, { status: 204 })
}

/** 400 Bad Request — validation failure */
export function badRequest(error: string, details?: ApiError['details']) {
  return NextResponse.json<ApiError>(
    { error, ...(details ? { details } : {}) },
    { status: 400 },
  )
}

/** 401 Unauthorized */
export function unauthorized(error = 'Unauthorized') {
  return NextResponse.json<ApiError>({ error }, { status: 401 })
}

/** 404 Not Found */
export function notFound(error = 'Not found') {
  return NextResponse.json<ApiError>({ error }, { status: 404 })
}

/** 409 Conflict — e.g. duplicate student_id */
export function conflict(error: string) {
  return NextResponse.json<ApiError>({ error }, { status: 409 })
}

/** 500 Internal Server Error */
export function serverError(error = 'Internal server error') {
  return NextResponse.json<ApiError>({ error }, { status: 500 })
}

/**
 * Wraps a route handler and catches unhandled errors so every route
 * returns a structured JSON error instead of a 500 HTML page.
 */
export function withErrorHandler(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      console.error('[API Error]', err)
      return serverError()
    }
  }
}
