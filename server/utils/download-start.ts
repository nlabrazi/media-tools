import type { DownloadStartRequest } from '~/shared/types/download'
import {
  DownloadValidationError,
  assertValidUrlForPlatform,
  isDownloadPlatform,
} from '~/shared/utils/download-validation'

type DownloadStartErrorCode =
  | 'FORMAT_REQUIRED'
  | 'PLATFORM_UNSUPPORTED'
  | 'URL_REQUIRED'
  | DownloadValidationError['code']

export const downloadStartErrorMessages: Record<DownloadStartErrorCode, string> = {
  FORMAT_REQUIRED: 'Format obligatoire.',
  PLATFORM_UNSUPPORTED: 'Plateforme non supportée.',
  URL_REQUIRED: 'URL obligatoire.',
  INVALID_URL: 'URL invalide.',
  UNSUPPORTED_PROTOCOL: 'Protocole URL non supporté.',
  PLATFORM_HOST_MISMATCH: 'Cette URL ne correspond pas à la plateforme demandée.',
}

export class DownloadStartError extends Error {
  constructor(public readonly code: DownloadStartErrorCode) {
    super(code)
  }
}

export interface ParsedDownloadStartBaseRequest extends DownloadStartRequest {}

export const parseDownloadStartBaseRequest = (
  body: Partial<DownloadStartRequest>,
): ParsedDownloadStartBaseRequest => {
  if (typeof body.url !== 'string' || !body.url.trim()) {
    throw new DownloadStartError('URL_REQUIRED')
  }

  if (!isDownloadPlatform(body.platform)) {
    throw new DownloadStartError('PLATFORM_UNSUPPORTED')
  }

  if (typeof body.formatId !== 'string' || !body.formatId.trim()) {
    throw new DownloadStartError('FORMAT_REQUIRED')
  }

  const cleanUrl = body.url.trim()

  try {
    assertValidUrlForPlatform(cleanUrl, body.platform)
  } catch (error) {
    if (error instanceof DownloadValidationError) {
      throw new DownloadStartError(error.code)
    }

    throw error
  }

  return {
    url: cleanUrl,
    platform: body.platform,
    formatId: body.formatId.trim(),
  }
}
