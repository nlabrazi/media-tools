import type {
  DownloadFormat,
  DownloadStartRequest,
  DownloadStartResponse,
} from '~/shared/types/download'
import { buildDownloadFilename } from '~/shared/utils/download-filename'
import { findDownloadFormat } from '~/shared/utils/download-format'
import { getMockDownloadFormats } from '~/shared/utils/download-mock'
import {
  DownloadValidationError,
  assertValidUrlForPlatform,
  isDownloadPlatform,
} from '~/shared/utils/download-validation'

type DownloadStartErrorCode =
  | 'FORMAT_REQUIRED'
  | 'FORMAT_UNSUPPORTED'
  | 'PLATFORM_UNSUPPORTED'
  | 'URL_REQUIRED'
  | DownloadValidationError['code']

export const downloadStartErrorMessages: Record<DownloadStartErrorCode, string> = {
  FORMAT_REQUIRED: 'Format obligatoire.',
  FORMAT_UNSUPPORTED: 'Format non supporté pour ce média.',
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

interface ParsedDownloadStartRequest extends DownloadStartRequest {
  format: DownloadFormat
}

export const parseDownloadStartRequest = (
  body: Partial<DownloadStartRequest>,
): ParsedDownloadStartRequest => {
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

  const format = findDownloadFormat(getMockDownloadFormats(body.platform), body.formatId)

  if (!format) {
    throw new DownloadStartError('FORMAT_UNSUPPORTED')
  }

  return {
    url: cleanUrl,
    platform: body.platform,
    formatId: format.id,
    format,
  }
}

export const buildMockDownloadStartResponse = (
  body: Partial<DownloadStartRequest>,
): DownloadStartResponse => {
  const request = parseDownloadStartRequest(body)
  const filename = buildDownloadFilename(request.platform, request.format)
  const payload = encodeURIComponent(
    `MediaTools mock download\nURL: ${request.url}\nPlatform: ${request.platform}\nFormat: ${request.format.label}\n`,
  )

  return {
    success: true,
    data: {
      downloadUrl: `data:text/plain;charset=utf-8,${payload}`,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      filename,
      format: request.format,
    },
  }
}
