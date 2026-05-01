import type {
  DownloadAnalysisRequest,
  DownloadAnalysisResponse,
  DownloadAnalysisResult,
  DownloadStartRequest,
  DownloadStartResponse,
} from '~/shared/types/download'
import { createDownloadStreamToken } from '../download-stream-tokens'
import type { DownloaderService } from './types'
import {
  YtDlpDownloaderError,
  type YtDlpDownloaderOptions,
  type YtDlpMetadata,
  buildYtDlpFilename,
  findMappedFormat,
  getYtDlpMetadata,
  mapYtDlpFormats,
  mapYtDlpMetadataToAnalysisResult as mapYtDlpMetadataToPlatformAnalysisResult,
} from './yt-dlp'

export const YouTubeDownloaderError = YtDlpDownloaderError
export type YouTubeDownloaderOptions = YtDlpDownloaderOptions
export { mapYtDlpFormats }

export const mapYtDlpMetadataToAnalysisResult = (
  metadata: YtDlpMetadata,
  sourceUrl: string,
): DownloadAnalysisResult => {
  return mapYtDlpMetadataToPlatformAnalysisResult(metadata, sourceUrl, 'youtube', 'youtube_video')
}

export const analyzeYouTubeDownload = async (
  request: DownloadAnalysisRequest,
  options: YouTubeDownloaderOptions = {},
): Promise<DownloadAnalysisResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)

  return {
    success: true,
    data: mapYtDlpMetadataToAnalysisResult(metadata, request.url),
  }
}

export const startYouTubeDownload = async (
  request: DownloadStartRequest,
  options: YouTubeDownloaderOptions = {},
): Promise<DownloadStartResponse> => {
  const metadata = await getYtDlpMetadata(request.url, options)
  const format = findMappedFormat(metadata, request.formatId)

  if (!format) {
    throw new YouTubeDownloaderError('FORMAT_NOT_FOUND')
  }

  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString()
  const filename = buildYtDlpFilename(metadata, format, 'youtube_video')
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

export const youtubeDownloaderService: DownloaderService = {
  async analyze(request, context) {
    return analyzeYouTubeDownload(request, {
      executablePath: context?.ytDlpPath,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },

  async start(request, context) {
    return startYouTubeDownload(request, {
      executablePath: context?.ytDlpPath,
      timeoutMs: context?.ytDlpTimeoutMs,
    })
  },
}
