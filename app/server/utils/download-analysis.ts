import type { DownloadAnalysisRequest, DownloadAnalysisResponse } from '~/shared/types/download'
import { buildMockDownloadAnalysisResponse } from '~/shared/utils/download-mock'
import {
  DownloadValidationError,
  assertValidUrlForPlatform,
  isDownloadPlatform,
} from '~/shared/utils/download-validation'

type DownloadAnalysisErrorCode =
  | 'URL_REQUIRED'
  | 'PLATFORM_UNSUPPORTED'
  | DownloadValidationError['code']

export const downloadAnalysisErrorMessages: Record<DownloadAnalysisErrorCode, string> = {
  URL_REQUIRED: 'URL obligatoire.',
  PLATFORM_UNSUPPORTED: 'Plateforme non supportée.',
  INVALID_URL: 'URL invalide.',
  UNSUPPORTED_PROTOCOL: 'Protocole URL non supporté.',
  PLATFORM_HOST_MISMATCH: 'Cette URL ne correspond pas à la plateforme demandée.',
}

export class DownloadAnalysisError extends Error {
  constructor(public readonly code: DownloadAnalysisErrorCode) {
    super(code)
  }
}

export const parseDownloadAnalysisRequest = (
  body: Partial<DownloadAnalysisRequest>,
): DownloadAnalysisRequest => {
  if (typeof body.url !== 'string' || !body.url.trim()) {
    throw new DownloadAnalysisError('URL_REQUIRED')
  }

  if (!isDownloadPlatform(body.platform)) {
    throw new DownloadAnalysisError('PLATFORM_UNSUPPORTED')
  }

  const cleanUrl = body.url.trim()

  try {
    assertValidUrlForPlatform(cleanUrl, body.platform)
  } catch (error) {
    if (error instanceof DownloadValidationError) {
      throw new DownloadAnalysisError(error.code)
    }

    throw error
  }

  return {
    url: cleanUrl,
    platform: body.platform,
    quality: body.quality,
  }
}

export const buildDownloadAnalysisResponse = (
  body: Partial<DownloadAnalysisRequest>,
): DownloadAnalysisResponse => {
  return buildMockDownloadAnalysisResponse(parseDownloadAnalysisRequest(body))
}
