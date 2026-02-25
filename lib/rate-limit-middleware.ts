import { type NextRequest, NextResponse } from "next/server"
import { rateLimit, type RateLimitType } from "./redis"

/**
 * Middleware helper for rate limiting API routes
 */
export async function withRateLimit(
  request: NextRequest,
  limitType: RateLimitType,
  handler: (request: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  // Get identifier (user ID from session or IP address)
  const identifier =
    request.headers.get("x-user-id") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "anonymous"

  // Check rate limit
  const { success, limit, remaining, reset } = await rateLimit(identifier, limitType)

  // Add rate limit headers
  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": new Date(reset).toISOString(),
  }

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers,
      },
    )
  }

  // Execute handler and add rate limit headers to response
  const response = await handler(request)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
