/*
  Placeholder pour le futur backend de téléchargement.
  Actuellement, valide la requête puis retourne un mock.
  À remplacer par le vrai service de téléchargement.
*/
import type { DownloadRequest, DownloadResponse } from '~/shared/types/download'
import {
  DownloadValidationError,
  assertValidUrlForPlatform,
  isDownloadPlatform,
} from '~/shared/utils/download-validation'

const validationErrorMessages: Record<DownloadValidationError['code'], string> = {
  INVALID_URL: 'URL invalide.',
  UNSUPPORTED_PROTOCOL: 'Protocole URL non supporté.',
  PLATFORM_HOST_MISMATCH: 'Cette URL ne correspond pas à la plateforme demandée.',
}

export default defineEventHandler(async (event): Promise<DownloadResponse> => {
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

  // Mock response
  return {
    success: true,
    data: {
      url: cleanUrl,
      platform: body.platform,
      downloadUrl: '#',
      filename: `media_${Date.now()}.mp4`,
      quality: body.quality || '1080p',
      fileSize: '15.7 MB',
    },
  }
})
