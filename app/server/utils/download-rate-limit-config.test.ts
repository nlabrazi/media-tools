import { describe, expect, it } from 'vitest'
import {
  defaultDownloadAnalyzeRateLimitConfig,
  normalizeDownloadAnalyzeRateLimitConfig,
} from './download-rate-limit-config'

describe('download rate limit config', () => {
  it('uses defaults when the runtime config is missing', () => {
    expect(normalizeDownloadAnalyzeRateLimitConfig(undefined)).toEqual(
      defaultDownloadAnalyzeRateLimitConfig,
    )
  })

  it('accepts positive integer values', () => {
    expect(
      normalizeDownloadAnalyzeRateLimitConfig({
        limit: 5,
        windowMs: 30_000,
      }),
    ).toEqual({
      limit: 5,
      windowMs: 30_000,
    })
  })

  it('accepts numeric strings from environment variables', () => {
    expect(
      normalizeDownloadAnalyzeRateLimitConfig({
        limit: '20',
        windowMs: '120000',
      }),
    ).toEqual({
      limit: 20,
      windowMs: 120_000,
    })
  })

  it('falls back per invalid field', () => {
    expect(
      normalizeDownloadAnalyzeRateLimitConfig({
        limit: 0,
        windowMs: 'invalid',
      }),
    ).toEqual(defaultDownloadAnalyzeRateLimitConfig)
  })
})
