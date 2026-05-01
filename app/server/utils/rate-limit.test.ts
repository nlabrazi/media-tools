import { describe, expect, it } from 'vitest'
import { createFixedWindowRateLimiter } from './rate-limit'

describe('fixed window rate limiter', () => {
  it('allows requests until the configured limit is reached', () => {
    const limiter = createFixedWindowRateLimiter({
      limit: 2,
      windowMs: 1000,
      now: () => 1000,
    })

    expect(limiter.check('user-1')).toEqual({
      allowed: true,
      remaining: 1,
      resetAt: 2000,
    })
    expect(limiter.check('user-1')).toEqual({
      allowed: true,
      remaining: 0,
      resetAt: 2000,
    })
    expect(limiter.check('user-1')).toEqual({
      allowed: false,
      remaining: 0,
      resetAt: 2000,
    })
  })

  it('keeps independent buckets per key', () => {
    const limiter = createFixedWindowRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: () => 1000,
    })

    expect(limiter.check('user-1').allowed).toBe(true)
    expect(limiter.check('user-1').allowed).toBe(false)
    expect(limiter.check('user-2').allowed).toBe(true)
  })

  it('opens a new window after the reset time', () => {
    let now = 1000
    const limiter = createFixedWindowRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: () => now,
    })

    expect(limiter.check('user-1').allowed).toBe(true)
    expect(limiter.check('user-1').allowed).toBe(false)

    now = 2000

    expect(limiter.check('user-1')).toEqual({
      allowed: true,
      remaining: 0,
      resetAt: 3000,
    })
  })
})
