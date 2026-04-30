export interface RateLimitOptions {
  limit: number
  windowMs: number
  now?: () => number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

interface RateLimitBucket {
  count: number
  resetAt: number
}

export const createFixedWindowRateLimiter = (options: RateLimitOptions) => {
  const buckets = new Map<string, RateLimitBucket>()
  const now = options.now || Date.now

  return {
    check(key: string): RateLimitResult {
      const currentTime = now()
      const bucketKey = key || 'anonymous'
      const currentBucket = buckets.get(bucketKey)

      if (!currentBucket || currentBucket.resetAt <= currentTime) {
        const resetAt = currentTime + options.windowMs
        buckets.set(bucketKey, { count: 1, resetAt })

        return {
          allowed: true,
          remaining: options.limit - 1,
          resetAt,
        }
      }

      if (currentBucket.count >= options.limit) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: currentBucket.resetAt,
        }
      }

      currentBucket.count += 1

      return {
        allowed: true,
        remaining: options.limit - currentBucket.count,
        resetAt: currentBucket.resetAt,
      }
    },
  }
}
