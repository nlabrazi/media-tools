import { type H3Event, createError, getRequestIP, readBody, setResponseHeader } from 'h3'
import type { DownloadAnalysisRequest, DownloadAnalysisResponse } from '~/shared/types/download'
import { useRuntimeConfig } from '#imports'
import { getDownloaderService } from '../services/downloaders'
import { UnsupportedDownloaderError } from '../services/downloaders/unsupported'
import { YtDlpDownloaderError } from '../services/downloaders/yt-dlp'
import { logApiError } from './api-logger'
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
    ytDlpCookiesPath?: string
    ytDlpJsRuntime?: string
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
    logApiError({
      event,
      level: 'warn',
      statusCode: 429,
      message: 'Download analysis rate limit exceeded',
    })

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
      ytDlpCookiesPath: runtimeConfig.download?.ytDlpCookiesPath,
      ytDlpJsRuntime: runtimeConfig.download?.ytDlpJsRuntime,
      ytDlpPath: runtimeConfig.download?.ytDlpPath,
      ytDlpTimeoutMs: runtimeConfig.download?.ytDlpTimeoutMs,
    })

    return response
  } catch (error) {
    if (error instanceof DownloadAnalysisError) {
      logApiError({
        error,
        event,
        level: 'warn',
        statusCode: 400,
        message: 'Invalid download analysis request',
      })

      throw createError({
        statusCode: 400,
        statusMessage: downloadAnalysisErrorMessages[error.code],
      })
    }

    if (error instanceof YtDlpDownloaderError) {
      const statusCode = error.code === 'NO_FORMATS_FOUND' ? 422 : 503

      logApiError({
        error,
        event,
        level: statusCode >= 500 ? 'error' : 'warn',
        statusCode,
        message: 'Download analysis failed',
      })

      throw createError({
        statusCode,
        message:
          error.code === 'AUTH_REQUIRED'
            ? 'YouTube demande une authentification anti-bot. Configurez un fichier cookies yt-dlp côté serveur.'
            : undefined,
        statusMessage:
          error.code === 'AUTH_REQUIRED'
            ? 'Authentification YouTube requise.'
            : error.code === 'NO_FORMATS_FOUND'
              ? 'Aucun format téléchargeable trouvé pour ce média.'
              : "Le service d'analyse est temporairement indisponible.",
      })
    }

    if (error instanceof UnsupportedDownloaderError) {
      logApiError({
        error,
        event,
        level: 'warn',
        statusCode: 501,
        message: 'Unsupported download analysis platform',
      })

      throw createError({
        message: `Le téléchargement ${error.platform} n'est pas encore disponible.`,
        statusCode: 501,
        statusMessage: 'Platform not implemented',
      })
    }

    logApiError({
      error,
      event,
      statusCode: 500,
      message: 'Unexpected download analysis error',
    })

    throw error
  }
}
