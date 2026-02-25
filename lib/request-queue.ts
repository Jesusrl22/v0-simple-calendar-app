/**
 * Rate-limited request queue to prevent hammering Supabase with concurrent requests
 * Implements exponential backoff and request deduplication
 */

interface QueuedRequest {
  key: string
  fn: () => Promise<any>
  retries: number
  priority: number
  timestamp: number
}

class RequestQueue {
  private queue: QueuedRequest[] = []
  private processing = false
  private rateLimitDelay = 1000 // Start with 1 second delay
  private maxRetries = 3
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheDuration = 10000 // Cache for 10 seconds
  private lastRequestTime = 0

  async enqueue<T>(
    key: string,
    fn: () => Promise<T>,
    priority: number = 0,
    useCache = true,
  ): Promise<T> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(key)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log("[v0] RequestQueue: Using cached data for", key)
        return cached.data
      }
    }

    // Add to queue
    return new Promise((resolve, reject) => {
      this.queue.push({
        key,
        fn: async () => {
          try {
            const result = await fn()
            // Cache successful result
            if (useCache) {
              this.cache.set(key, { data: result, timestamp: Date.now() })
            }
            resolve(result)
          } catch (error) {
            reject(error)
          }
        },
        retries: 0,
        priority,
        timestamp: Date.now(),
      })

      // Sort by priority (higher first, then by timestamp - older first)
      this.queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp)

      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const request = this.queue.shift()
      if (!request) break

      // Rate limit: ensure minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime
      if (timeSinceLastRequest < this.rateLimitDelay) {
        await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
      }

      this.lastRequestTime = Date.now()

      try {
        console.log("[v0] RequestQueue: Processing request", request.key)
        await request.fn()
      } catch (error: any) {
        // Handle rate limiting with exponential backoff
        if (error?.status === 429 || String(error).includes("429") || String(error).includes("Too Many")) {
          if (request.retries < this.maxRetries) {
            console.warn(
              `[v0] RequestQueue: Rate limited for ${request.key}, retrying (${request.retries + 1}/${this.maxRetries})`,
            )
            request.retries++

            // Exponential backoff: 2s, 4s, 8s
            const delayMs = Math.pow(2, request.retries) * 1000
            await new Promise((resolve) => setTimeout(resolve, delayMs))

            // Re-add to queue for retry
            this.queue.unshift(request)
          } else {
            console.error("[v0] RequestQueue: Max retries reached for", request.key)
          }
        } else {
          console.error("[v0] RequestQueue: Request failed for", request.key, error)
        }
      }
    }

    this.processing = false
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

export const requestQueue = new RequestQueue()
