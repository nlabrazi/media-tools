import { type H3Event, createError, getRequestIP, readBody, setResponseHeader } from 'h3'
import type { DownloadRequest, DownloadResponse } from '~/shared/types/download'
import {
  DownloadAnalysisError,
  buildDownloadAnalysisResponse,
  downloadAnalysisErrorMessages,
} from './download-analysis'
import { createFixedWindowRateLimiter } from './rate-limit'

const downloadAnalyzeRateLimiter = createFixedWindowRateLimiter({
  limit: 10,
  windowMs: 60_000,
})

export const handleDownloadAnalysisRequest = async (event: H3Event): Promise<DownloadResponse> => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  const rateLimit = downloadAnalyzeRateLimiter.check(clientIp)

  setResponseHeader(event, 'X-RateLimit-Limit', '10')
  setResponseHeader(event, 'X-RateLimit-Remaining', rateLimit.remaining.toString())
  setResponseHeader(event, 'X-RateLimit-Reset', Math.ceil(rateLimit.resetAt / 1000).toString())

  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de tentatives. Réessayez dans quelques instants.',
    })
  }

  const body = await readBody<Partial<DownloadRequest>>(event)

  try {
    const response = buildDownloadAnalysisResponse(body)

    // Simulation de temps de traitement
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return response
  } catch (error) {
    if (error instanceof DownloadAnalysisError) {
      throw createError({
        statusCode: 400,
        statusMessage: downloadAnalysisErrorMessages[error.code],
      })
    }

    throw error
  }
}
