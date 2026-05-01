import { type H3Event, createError, getRequestIP, readBody, setResponseHeader } from 'h3'
import type { DownloadAnalysisRequest, DownloadAnalysisResponse } from '~/shared/types/download'
import { useRuntimeConfig } from '#imports'
import { getDownloaderService } from '../services/downloaders'
import { YouTubeDownloaderError } from '../services/downloaders/youtube'
import {
  DownloadAnalysisError,
  downloadAnalysisErrorMessages,
  parseDownloadAnalysisRequest,
} from './download-analysis'
import { normalizeDownloadAnalyzeRateLimitConfig } from './download-rate-limit-config'
import { createFixedWindowRateLimiter } from './rate-limit'

type DownloadRuntimeConfig = {
  download?: {
    analyzeRateLimit?: unknown
    ytDlpPath?: string
    ytDlpTimeoutMs?: number
  }
}

const downloadAnalyzeRateLimiters = new Map<
  string,
  ReturnType<typeof createFixedWindowRateLimiter>
>()

const getDownloadAnalyzeRateLimiter = (
  config: ReturnType<typeof normalizeDownloadAnalyzeRateLimitConfig>,
) => {
  const limiterKey = `${config.limit}:${config.windowMs}`
  const existingLimiter = downloadAnalyzeRateLimiters.get(limiterKey)

  if (existingLimiter) {
    return existingLimiter
  }

  const limiter = createFixedWindowRateLimiter(config)
  downloadAnalyzeRateLimiters.set(limiterKey, limiter)

  return limiter
}

export const handleDownloadAnalysisRequest = async (
  event: H3Event,
): Promise<DownloadAnalysisResponse> => {
  const runtimeConfig = useRuntimeConfig(event) as DownloadRuntimeConfig
  const rateLimitConfig = normalizeDownloadAnalyzeRateLimitConfig(
    runtimeConfig.download?.analyzeRateLimit,
  )
  const downloadAnalyzeRateLimiter = getDownloadAnalyzeRateLimiter(rateLimitConfig)
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  const rateLimit = downloadAnalyzeRateLimiter.check(clientIp)

  setResponseHeader(event, 'X-RateLimit-Limit', rateLimitConfig.limit.toString())
  setResponseHeader(event, 'X-RateLimit-Remaining', rateLimit.remaining.toString())
  setResponseHeader(event, 'X-RateLimit-Reset', Math.ceil(rateLimit.resetAt / 1000).toString())

  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de tentatives. Réessayez dans quelques instants.',
    })
  }

  const body = await readBody<Partial<DownloadAnalysisRequest>>(event)

  try {
    const request = parseDownloadAnalysisRequest(body)
    const downloaderService = getDownloaderService(request.platform)
    const response = await downloaderService.analyze(request, {
      ytDlpPath: runtimeConfig.download?.ytDlpPath,
      ytDlpTimeoutMs: runtimeConfig.download?.ytDlpTimeoutMs,
    })

    // Simulation de temps de traitement
    if (request.platform !== 'youtube') {
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    return response
  } catch (error) {
    if (error instanceof DownloadAnalysisError) {
      throw createError({
        statusCode: 400,
        statusMessage: downloadAnalysisErrorMessages[error.code],
      })
    }

    if (error instanceof YouTubeDownloaderError) {
      throw createError({
        statusCode: error.code === 'NO_FORMATS_FOUND' ? 422 : 503,
        statusMessage:
          error.code === 'NO_FORMATS_FOUND'
            ? 'Aucun format téléchargeable trouvé pour cette vidéo YouTube.'
            : "Le service d'analyse YouTube est temporairement indisponible.",
      })
    }

    throw error
  }
}
