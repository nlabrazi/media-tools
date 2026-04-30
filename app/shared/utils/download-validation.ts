import { type DownloadPlatform, downloadPlatforms } from '~/shared/types/download'

const platformHosts: Record<DownloadPlatform, string[]> = {
  instagram: ['instagram.com'],
  tiktok: ['tiktok.com', 'vm.tiktok.com'],
  youtube: ['youtube.com', 'youtu.be'],
  twitter: ['twitter.com', 'x.com'],
}

export type DownloadValidationErrorCode =
  | 'INVALID_URL'
  | 'UNSUPPORTED_PROTOCOL'
  | 'PLATFORM_HOST_MISMATCH'

export class DownloadValidationError extends Error {
  constructor(public readonly code: DownloadValidationErrorCode) {
    super(code)
  }
}

export const isDownloadPlatform = (platform: unknown): platform is DownloadPlatform => {
  return typeof platform === 'string' && downloadPlatforms.includes(platform as DownloadPlatform)
}

export const normalizeHostname = (hostname: string) => hostname.replace(/^www\./, '')

export const assertValidUrlForPlatform = (url: string, platform: DownloadPlatform) => {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch {
    throw new DownloadValidationError('INVALID_URL')
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new DownloadValidationError('UNSUPPORTED_PROTOCOL')
  }

  const hostname = normalizeHostname(parsedUrl.hostname)

  if (!platformHosts[platform].includes(hostname)) {
    throw new DownloadValidationError('PLATFORM_HOST_MISMATCH')
  }
}
