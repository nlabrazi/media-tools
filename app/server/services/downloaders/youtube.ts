import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type {
  DownloadAnalysisRequest,
  DownloadAnalysisResponse,
  DownloadAnalysisResult,
  DownloadFormat,
  DownloadStartRequest,
  DownloadStartResponse,
} from '~/shared/types/download'
import type { DownloaderService } from './types'

const execFileAsync = promisify(execFile)

type YouTubeDownloaderErrorCode = 'FORMAT_NOT_FOUND' | 'NO_FORMATS_FOUND' | 'SERVICE_UNAVAILABLE'

export class YouTubeDownloaderError extends Error {
  constructor(public readonly code: YouTubeDownloaderErrorCode) {
    super(code)
  }
}

export interface YouTubeDownloaderOptions {
  executablePath?: string
  timeoutMs?: number
}

interface YtDlpFormat {
  abr?: number
  acodec?: string
  ext?: string
  filesize?: number
  filesize_approx?: number
  format_id?: string
  height?: number
  protocol?: string
  tbr?: number
  url?: string
  vcodec?: string
}

interface YtDlpMetadata {
  formats?: YtDlpFormat[]
  thumbnail?: string
  title?: string
}

const defaultYouTubeDownloaderOptions: Required<YouTubeDownloaderOptions> = {
  executablePath: 'yt-dlp',
  timeoutMs: 30_000,
}

const runYtDlp = async (
  args: string[],
  options: YouTubeDownloaderOptions = {},
): Promise<string> => {
  const downloaderOptions = { ...defaultYouTubeDownloaderOptions, ...options }

  try {
    const { stdout } = await execFileAsync(downloaderOptions.executablePath, args, {
      timeout: downloaderOptions.timeoutMs,
    })

    return stdout
  } catch {
    throw new YouTubeDownloaderError('SERVICE_UNAVAILABLE')
  }
}

const getYtDlpMetadata = async (
  url: string,
  options: YouTubeDownloaderOptions = {},
): Promise<YtDlpMetadata> => {
  const stdout = await runYtDlp(
    ['--dump-single-json', '--no-playlist', '--no-warnings', url],
    options,
  )

  try {
    return JSON.parse(stdout) as YtDlpMetadata
  } catch {
    throw new YouTubeDownloaderError('SERVICE_UNAVAILABLE')
  }
}

const getYtDlpFormatUrl = async (
  url: string,
  formatId: string,
  options: YouTubeDownloaderOptions = {},
): Promise<string> => {
  const stdout = await runYtDlp(
    ['--get-url', '--no-playlist', '--no-warnings', '-f', formatId, url],
    options,
  )
  const [downloadUrl] = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!downloadUrl) {
    throw new YouTubeDownloaderError('FORMAT_NOT_FOUND')
  }

  return downloadUrl
}

const isUnavailableCodec = (codec: string | undefined) => !codec || codec === 'none'

const isDirectHttpFormat = (format: YtDlpFormat) => {
  return !format.protocol || ['https', 'http'].includes(format.protocol)
}

const formatBytes = (bytes: number | undefined): string => {
  if (!bytes || bytes <= 0) {
    return 'Taille inconnue'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const sanitizeFilenamePart = (value: string) => {
  return value
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80)
}

const buildYtDlpFilename = (metadata: YtDlpMetadata, format: DownloadFormat) => {
  const safeTitle = sanitizeFilenamePart(metadata.title || 'youtube_video') || 'youtube_video'

  return `${safeTitle}.${format.extension || 'mp4'}`
}

const getFormatSize = (format: YtDlpFormat) => format.filesize || format.filesize_approx

const mapVideoFormat = (format: YtDlpFormat): DownloadFormat | null => {
  if (
    !format.format_id ||
    !format.height ||
    isUnavailableCodec(format.vcodec) ||
    isUnavailableCodec(format.acodec) ||
    !isDirectHttpFormat(format)
  ) {
    return null
  }

  const extension = format.ext || 'mp4'

  return {
    extension,
    id: format.format_id,
    label: `${format.height}p ${extension.toUpperCase()}`,
    type: 'video',
  }
}

const mapAudioFormat = (format: YtDlpFormat): DownloadFormat | null => {
  if (
    !format.format_id ||
    isUnavailableCodec(format.acodec) ||
    !isUnavailableCodec(format.vcodec) ||
    !isDirectHttpFormat(format)
  ) {
    return null
  }

  const bitrate = Math.round(format.abr || format.tbr || 0)
  const extension = format.ext || 'm4a'

  return {
    extension,
    id: format.format_id,
    label:
      bitrate > 0
        ? `Audio ${bitrate}kbps ${extension.toUpperCase()}`
        : `Audio ${extension.toUpperCase()}`,
    type: 'audio',
  }
}

const uniqueFormats = (formats: DownloadFormat[]) => {
  const seenLabels = new Set<string>()

  return formats.filter((format) => {
    if (seenLabels.has(format.label)) {
      return false
    }

    seenLabels.add(format.label)
    return true
  })
}

export const mapYtDlpFormats = (formats: YtDlpFormat[] = []): DownloadFormat[] => {
  const videoFormats = formats
    .map(mapVideoFormat)
    .filter((format): format is DownloadFormat => Boolean(format))
    .sort((first, second) => Number.parseInt(second.label) - Number.parseInt(first.label))

  const audioFormats = formats
    .map(mapAudioFormat)
    .filter((format): format is DownloadFormat => Boolean(format))
    .slice(0, 2)

  return uniqueFormats([...videoFormats, ...audioFormats]).slice(0, 8)
}

const findSourceFormat = (metadata: YtDlpMetadata, formatId: string): YtDlpFormat | null => {
  return metadata.formats?.find((format) => format.format_id === formatId) || null
}

const findMappedFormat = (metadata: YtDlpMetadata, formatId: string): DownloadFormat | null => {
  return mapYtDlpFormats(metadata.formats).find((format) => format.id === formatId) || null
}

export const mapYtDlpMetadataToAnalysisResult = (
  metadata: YtDlpMetadata,
  sourceUrl: string,
): DownloadAnalysisResult => {
  const formats = mapYtDlpFormats(metadata.formats)

  if (!formats.length) {
    throw new YouTubeDownloaderError('NO_FORMATS_FOUND')
  }

  const selectedFormat = formats[0]

  if (!selectedFormat) {
    throw new YouTubeDownloaderError('NO_FORMATS_FOUND')
  }

  const selectedSourceFormat = findSourceFormat(metadata, selectedFormat.id)

  return {
    downloadUrl: '#',
    fileSize: formatBytes(getFormatSize(selectedSourceFormat || {})),
    filename: buildYtDlpFilename(metadata, selectedFormat),
    formats,
    platform: 'youtube',
    preview: metadata.thumbnail || '',
    quality: selectedFormat.label,
    url: sourceUrl,
  }
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

  const downloadUrl = await getYtDlpFormatUrl(request.url, request.formatId, options)

  return {
    success: true,
    data: {
      downloadUrl,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      filename: buildYtDlpFilename(metadata, format),
      format,
    },
  }
}

export const youtubeDownloaderService: DownloaderService = {
  async analyze(request, context) {
    return analyzeYouTubeDownload(request, {
      executablePath: context?.ytDlpPath,
    })
  },

  async start(request, context) {
    return startYouTubeDownload(request, {
      executablePath: context?.ytDlpPath,
    })
  },
}
