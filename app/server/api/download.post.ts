/*
  Placeholder pour le futur backend de téléchargement.
  Actuellement, valide la requête puis retourne un mock.
  À remplacer par le vrai service de téléchargement.
*/
import type { DownloadRequest, DownloadResponse } from '~/shared/types/download'
import { buildMockDownloadResponse } from '~/shared/utils/download-mock'
import {
  DownloadValidationError,
  assertValidUrlForPlatform,
  isDownloadPlatform,
} from '~/shared/utils/download-validation'
import { createFixedWindowRateLimiter } from '../utils/rate-limit'

const validationErrorMessages: Record<DownloadValidationError['code'], string> = {
  INVALID_URL: 'URL invalide.',
  UNSUPPORTED_PROTOCOL: 'Protocole URL non supporté.',
  PLATFORM_HOST_MISMATCH: 'Cette URL ne correspond pas à la plateforme demandée.',
}

const downloadRateLimiter = createFixedWindowRateLimiter({
  limit: 10,
  windowMs: 60_000,
})

export default defineEventHandler(async (event): Promise<DownloadResponse> => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  const rateLimit = downloadRateLimiter.check(clientIp)

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

  if (typeof body.url !== 'string' || !body.url.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL obligatoire.',
    })
  }

  if (!isDownloadPlatform(body.platform)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Plateforme non supportée.',
    })
  }

  const cleanUrl = body.url.trim()

  try {
    assertValidUrlForPlatform(cleanUrl, body.platform)
  } catch (error) {
    if (error instanceof DownloadValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: validationErrorMessages[error.code],
      })
    }

    throw error
  }

  // Simulation de temps de traitement
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return buildMockDownloadResponse({
    url: cleanUrl,
    platform: body.platform,
    quality: body.quality,
  })
})
