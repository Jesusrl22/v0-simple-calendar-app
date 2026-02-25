import { Redis } from "@upstash/redis"

// Lazy initialize Redis client
let redisClient: Redis | null = null

function getRedisClient(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }

  if (!redisClient) {
    try {
      redisClient = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    } catch (error) {
      console.error("[v0] Failed to initialize Redis:", error)
      return null
    }
  }

  return redisClient
}

export const redis = {
  get client() {
    return getRedisClient()
  },
}

// Rate limiting configuration
export const RATE_LIMITS = {
  // API endpoints
  api: {
    requests: 100, // 100 requests
    window: 60, // per 60 seconds (1 minute)
  },
  // AI chat endpoint (more restrictive)
  aiChat: {
    requests: 20, // 20 requests
    window: 60, // per 60 seconds
  },
  // Authentication endpoints
  auth: {
    requests: 5, // 5 attempts
    window: 300, // per 5 minutes
  },
  // Admin endpoints
  admin: {
    requests: 50,
    window: 60,
  },
}

export type RateLimitType = keyof typeof RATE_LIMITS

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (user ID, IP, etc.)
 * @param limitType - Type of rate limit to apply
 * @returns Object with success status and remaining requests
 */
export async function rateLimit(
  identifier: string,
  limitType: RateLimitType = "api",
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const { requests, window } = RATE_LIMITS[limitType]
  const key = `ratelimit:${limitType}:${identifier}`

  const client = getRedisClient()

  if (!client) {
    return {
      success: true,
      limit: requests,
      remaining: requests,
      reset: Date.now() + window * 1000,
    }
  }

  try {
    const pipeline = client.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, window)

    const results = await pipeline.exec()
    const count = results[0] as number

    const remaining = Math.max(0, requests - count)
    const reset = Date.now() + window * 1000

    return {
      success: count <= requests,
      limit: requests,
      remaining,
      reset,
    }
  } catch (error) {
    console.error("[v0] Rate limit error:", error)
    return {
      success: true,
      limit: requests,
      remaining: requests,
      reset: Date.now() + window * 1000,
    }
  }
}

/**
 * Cache helper for frequently accessed data
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const data = await client.get<T>(key)
    return data
  } catch (error) {
    console.error("[v0] Cache get error:", error)
    return null
  }
}

export async function cacheSet(key: string, value: any, expirationSeconds = 3600): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.set(key, value, { ex: expirationSeconds })
  } catch (error) {
    console.error("[v0] Cache set error:", error)
  }
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.del(key)
  } catch (error) {
    console.error("[v0] Cache delete error:", error)
  }
}
