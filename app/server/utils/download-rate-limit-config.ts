import type { RateLimitOptions } from './rate-limit'

export const defaultDownloadAnalyzeRateLimitConfig: RateLimitOptions = {
  limit: 10,
  windowMs: 60_000,
}

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsedValue = typeof value === 'string' ? Number(value) : value

  if (typeof parsedValue !== 'number' || !Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback
  }

  return parsedValue
}

export const normalizeDownloadAnalyzeRateLimitConfig = (config: unknown): RateLimitOptions => {
  if (typeof config !== 'object' || config === null) {
    return defaultDownloadAnalyzeRateLimitConfig
  }

  const rawConfig = config as Record<string, unknown>

  return {
    limit: parsePositiveInteger(rawConfig.limit, defaultDownloadAnalyzeRateLimitConfig.limit),
    windowMs: parsePositiveInteger(
      rawConfig.windowMs,
      defaultDownloadAnalyzeRateLimitConfig.windowMs,
    ),
  }
}
