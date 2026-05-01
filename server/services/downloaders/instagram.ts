import type {
  DownloadAnalysisRequest,
  DownloadAnalysisResponse,
  DownloadStartRequest,
  DownloadStartResponse,
} from '~/shared/types/download'
import { createDownloadStreamToken } from '../download-stream-tokens'
import type { DownloaderService } from './types'
import {
  YtDlpDownloaderError,
  type YtDlpDownloaderOptions,
  buildYtDlpFilename,
  findMappedFormat,
  getYtDlpMetadata,
  mapYtDlpMetadataToAnalysisResult,
} from './yt-dlp'

export const InstagramDownloaderError = YtDlpDownloaderError
export type InstagramDownloaderOptions = YtDlpDownloaderOptions

const instagramFormatOptions = {
  includeDirectVideoOnlyFormats: true,
}

export const analyzeInstagramDownload = async (
  request: DownloadAnalysisRequest,
  options: InstagramDownloaderOptions = {},
): Promise<DownloadAnalysisResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)

  return {
    success: true,
    data: mapYtDlpMetadataToAnalysisResult(
      metadata,
      request.url,
      'instagram',
      'instagram_media',
      instagramFormatOptions,
    ),
  }
}

export const startInstagramDownload = async (
  request: DownloadStartRequest,
  options: InstagramDownloaderOptions = {},
): Promise<DownloadStartResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)
  const format = findMappedFormat(metadata, request.formatId, instagramFormatOptions)

  if (!format) {
    throw new InstagramDownloaderError('FORMAT_NOT_FOUND')
  }

  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString()
  const filename = buildYtDlpFilename(metadata, format, 'instagram_media')
  const token = createDownloadStreamToken({
    expiresAt,
    filename,
    formatId: request.formatId,
    options,
    url: request.url,
  })

  return {
    success: true,
    data: {
      downloadUrl: `/api/download/stream/${token}`,
      expiresAt,
      filename,
      format,
    },
  }
}

export const instagramDownloaderService: DownloaderService = {
  async analyze(request, context) {
    return analyzeInstagramDownload(request, {
      cookiesPath: context?.ytDlpCookiesPath,
      executablePath: context?.ytDlpPath,
      jsRuntime: context?.ytDlpJsRuntime,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },

  async start(request, context) {
    return startInstagramDownload(request, {
      cookiesPath: context?.ytDlpCookiesPath,
      executablePath: context?.ytDlpPath,
      jsRuntime: context?.ytDlpJsRuntime,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },
}
