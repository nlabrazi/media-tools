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

export const TikTokDownloaderError = YtDlpDownloaderError
export type TikTokDownloaderOptions = YtDlpDownloaderOptions

export const analyzeTikTokDownload = async (
  request: DownloadAnalysisRequest,
  options: TikTokDownloaderOptions = {},
): Promise<DownloadAnalysisResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)

  return {
    success: true,
    data: mapYtDlpMetadataToAnalysisResult(metadata, request.url, 'tiktok', 'tiktok_video'),
  }
}

export const startTikTokDownload = async (
  request: DownloadStartRequest,
  options: TikTokDownloaderOptions = {},
): Promise<DownloadStartResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)
  const format = findMappedFormat(metadata, request.formatId)

  if (!format) {
    throw new TikTokDownloaderError('FORMAT_NOT_FOUND')
  }

  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString()
  const filename = buildYtDlpFilename(metadata, format, 'tiktok_video')
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

export const tiktokDownloaderService: DownloaderService = {
  async analyze(request, context) {
    return analyzeTikTokDownload(request, {
      executablePath: context?.ytDlpPath,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },

  async start(request, context) {
    return startTikTokDownload(request, {
      executablePath: context?.ytDlpPath,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },
}
