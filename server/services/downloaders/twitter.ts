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

export const TwitterDownloaderError = YtDlpDownloaderError
export type TwitterDownloaderOptions = YtDlpDownloaderOptions

export const analyzeTwitterDownload = async (
  request: DownloadAnalysisRequest,
  options: TwitterDownloaderOptions = {},
): Promise<DownloadAnalysisResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)

  return {
    success: true,
    data: mapYtDlpMetadataToAnalysisResult(metadata, request.url, 'twitter', 'twitter_video', {
      includeDirectVideoOnlyFormats: true,
    }),
  }
}

export const startTwitterDownload = async (
  request: DownloadStartRequest,
  options: TwitterDownloaderOptions = {},
): Promise<DownloadStartResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)
  const format = findMappedFormat(metadata, request.formatId, {
    includeDirectVideoOnlyFormats: true,
  })

  if (!format) {
    throw new TwitterDownloaderError('FORMAT_NOT_FOUND')
  }

  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString()
  const filename = buildYtDlpFilename(metadata, format, 'twitter_video')
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

export const twitterDownloaderService: DownloaderService = {
  async analyze(request, context) {
    return analyzeTwitterDownload(request, {
      cookiesPath: context?.ytDlpCookiesPath,
      executablePath: context?.ytDlpPath,
      jsRuntime: context?.ytDlpJsRuntime,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },

  async start(request, context) {
    return startTwitterDownload(request, {
      cookiesPath: context?.ytDlpCookiesPath,
      executablePath: context?.ytDlpPath,
      jsRuntime: context?.ytDlpJsRuntime,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },
}
