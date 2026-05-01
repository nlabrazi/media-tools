import { execFile, spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import type { ReadStream } from 'node:fs'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Readable } from 'node:stream'
import type {
  DownloadAnalysisResult,
  DownloadFormat,
  DownloadPlatform,
} from '~/shared/types/download'

export type YtDlpDownloaderErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORMAT_NOT_FOUND'
  | 'INVALID_METADATA'
  | 'NO_FORMATS_FOUND'
  | 'SERVICE_TIMEOUT'
  | 'SERVICE_UNAVAILABLE'

export class YtDlpDownloaderError extends Error {
  constructor(public readonly code: YtDlpDownloaderErrorCode) {
    super(code)
  }
}

export interface YtDlpDownloaderOptions {
  cookiesPath?: string
  executablePath?: string
  jsRuntime?: string
  maxBuffer?: number
  timeoutMs?: number
}

export interface YtDlpFormat {
  abr?: number
  acodec?: string
  audio_ext?: string
  ext?: string
  filesize?: number
  filesize_approx?: number
  format_id?: string
  height?: number
  protocol?: string
  tbr?: number
  url?: string
  video_ext?: string
  vcodec?: string
  width?: number
}

export interface YtDlpMetadata {
  formats?: YtDlpFormat[]
  requested_downloads?: YtDlpFormat[]
  thumbnail?: string
  title?: string
}

export interface YtDlpPreparedDownload {
  cleanup: () => Promise<void>
  filePath: string
  size: number
  stream: ReadStream
}

interface YtDlpFormatMappingOptions {
  includeDirectVideoOnlyFormats?: boolean
}

const defaultYtDlpDownloaderOptions: Required<YtDlpDownloaderOptions> = {
  cookiesPath: '',
  executablePath: 'yt-dlp',
  jsRuntime: `node:${process.execPath}`,
  maxBuffer: 10 * 1024 * 1024,
  timeoutMs: 30_000,
}

const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

const normalizeYtDlpDownloaderOptions = (
  options: YtDlpDownloaderOptions = {},
): Required<YtDlpDownloaderOptions> => {
  return {
    cookiesPath: options.cookiesPath || defaultYtDlpDownloaderOptions.cookiesPath,
    executablePath: options.executablePath || defaultYtDlpDownloaderOptions.executablePath,
    jsRuntime: options.jsRuntime || defaultYtDlpDownloaderOptions.jsRuntime,
    maxBuffer: isPositiveNumber(options.maxBuffer)
      ? options.maxBuffer
      : defaultYtDlpDownloaderOptions.maxBuffer,
    timeoutMs: isPositiveNumber(options.timeoutMs)
      ? options.timeoutMs
      : defaultYtDlpDownloaderOptions.timeoutMs,
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isTimeoutError = (error: unknown): boolean => {
  if (!isRecord(error)) {
    return false
  }

  return error.code === 'ETIMEDOUT' || error.killed === true || error.signal === 'SIGTERM'
}

const isAuthenticationRequiredError = (stderr: string) => {
  return (
    stderr.includes('Sign in to confirm') ||
    stderr.includes('--cookies-from-browser') ||
    stderr.includes('--cookies for the authentication')
  )
}

const getYtDlpProcessErrorCode = (
  error: unknown,
  stderr = '',
): Exclude<
  YtDlpDownloaderErrorCode,
  'FORMAT_NOT_FOUND' | 'INVALID_METADATA' | 'NO_FORMATS_FOUND'
> => {
  if (isTimeoutError(error)) {
    return 'SERVICE_TIMEOUT'
  }

  if (isAuthenticationRequiredError(stderr)) {
    return 'AUTH_REQUIRED'
  }

  return 'SERVICE_UNAVAILABLE'
}

const buildYtDlpBaseArgs = (options: Required<YtDlpDownloaderOptions>) => {
  const args = ['--no-playlist', '--no-warnings']

  if (options.jsRuntime) {
    args.push('--js-runtimes', options.jsRuntime)
  }

  if (options.cookiesPath) {
    args.push('--cookies', options.cookiesPath)
  }

  return args
}

export const runYtDlp = async (
  args: string[],
  options: YtDlpDownloaderOptions = {},
): Promise<string> => {
  const downloaderOptions = normalizeYtDlpDownloaderOptions(options)

  return new Promise((resolve, reject) => {
    execFile(
      downloaderOptions.executablePath,
      args,
      {
        maxBuffer: downloaderOptions.maxBuffer,
        timeout: downloaderOptions.timeoutMs,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new YtDlpDownloaderError(getYtDlpProcessErrorCode(error, stderr.toString())))
          return
        }

        resolve(stdout.toString())
      },
    )
  })
}

export const getYtDlpMetadata = async (
  url: string,
  options: YtDlpDownloaderOptions = {},
): Promise<YtDlpMetadata> => {
  const downloaderOptions = normalizeYtDlpDownloaderOptions(options)
  const stdout = await runYtDlp(
    ['--dump-single-json', ...buildYtDlpBaseArgs(downloaderOptions), url],
    downloaderOptions,
  )

  try {
    return JSON.parse(stdout) as YtDlpMetadata
  } catch {
    throw new YtDlpDownloaderError('INVALID_METADATA')
  }
}

export const getYtDlpFormatUrl = async (
  url: string,
  formatId: string,
  options: YtDlpDownloaderOptions = {},
): Promise<string> => {
  const downloaderOptions = normalizeYtDlpDownloaderOptions(options)
  const stdout = await runYtDlp(
    ['--get-url', ...buildYtDlpBaseArgs(downloaderOptions), '-f', formatId, url],
    downloaderOptions,
  )
  const [downloadUrl] = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!downloadUrl) {
    throw new YtDlpDownloaderError('FORMAT_NOT_FOUND')
  }

  return downloadUrl
}

export const prepareYtDlpFormatDownload = async (
  url: string,
  formatId: string,
  options: YtDlpDownloaderOptions = {},
): Promise<YtDlpPreparedDownload> => {
  const downloaderOptions = normalizeYtDlpDownloaderOptions(options)
  const directory = await mkdtemp(join(tmpdir(), 'media-tools-download-'))
  const filePath = join(directory, 'download')

  await new Promise<void>((resolve, reject) => {
    const stderrChunks: Buffer[] = []
    const childProcess = spawn(
      downloaderOptions.executablePath,
      [...buildYtDlpBaseArgs(downloaderOptions), '-f', formatId, '-o', filePath, url],
      {
        stdio: ['ignore', 'ignore', 'pipe'],
      },
    )

    const timeout = setTimeout(() => {
      childProcess.kill('SIGTERM')
      reject(new YtDlpDownloaderError('SERVICE_TIMEOUT'))
    }, downloaderOptions.timeoutMs)

    const cleanupProcess = () => {
      clearTimeout(timeout)
    }

    const getStderr = () => Buffer.concat(stderrChunks).toString('utf8')

    const rejectWithServiceError = (error?: unknown) => {
      cleanupProcess()
      reject(new YtDlpDownloaderError(getYtDlpProcessErrorCode(error, getStderr())))
    }

    childProcess.stderr.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk)
    })

    childProcess.once('error', rejectWithServiceError)
    childProcess.once('close', (code) => {
      cleanupProcess()

      if (code === 0) {
        resolve()
        return
      }

      rejectWithServiceError()
    })
  }).catch(async (error) => {
    await rm(directory, { force: true, recursive: true })
    throw error
  })

  const fileStats = await stat(filePath).catch(async () => {
    await rm(directory, { force: true, recursive: true })
    throw new YtDlpDownloaderError('SERVICE_UNAVAILABLE')
  })

  if (fileStats.size <= 0) {
    await rm(directory, { force: true, recursive: true })
    throw new YtDlpDownloaderError('SERVICE_UNAVAILABLE')
  }

  const stream = createReadStream(filePath)

  stream.once('error', async () => {
    await rm(directory, { force: true, recursive: true })
  })

  return {
    cleanup: () => rm(directory, { force: true, recursive: true }),
    filePath,
    size: fileStats.size,
    stream,
  }
}

export const streamYtDlpFormat = (
  url: string,
  formatId: string,
  options: YtDlpDownloaderOptions = {},
): Readable => {
  const downloaderOptions = normalizeYtDlpDownloaderOptions(options)
  const process = spawn(
    downloaderOptions.executablePath,
    [...buildYtDlpBaseArgs(downloaderOptions), '-f', formatId, '-o', '-', url],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  process.stderr.resume()

  return process.stdout
}

const isUnavailableCodec = (codec: string | undefined) => !codec || codec === 'none'

const isDirectHttpFormat = (format: YtDlpFormat) => {
  return !format.protocol || ['https', 'http'].includes(format.protocol)
}

export const formatBytes = (bytes: number | undefined): string => {
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

export const buildYtDlpFilename = (
  metadata: YtDlpMetadata,
  format: DownloadFormat,
  fallbackName: string,
) => {
  const safeTitle = sanitizeFilenamePart(metadata.title || fallbackName) || fallbackName

  return `${safeTitle}.${format.extension || 'mp4'}`
}

const getFormatSize = (format: YtDlpFormat) => format.filesize || format.filesize_approx

const mapRequestedDownloadFormat = (format: YtDlpFormat): DownloadFormat | null => {
  if (!format.format_id || !format.height) {
    return null
  }

  const extension = format.ext || format.video_ext || 'mp4'

  return {
    extension,
    id: format.format_id,
    label: `${format.height}p ${extension.toUpperCase()}`,
    type: 'video',
  }
}

const mapDirectVideoOnlyFormat = (format: YtDlpFormat): DownloadFormat | null => {
  if (
    !format.format_id ||
    !format.height ||
    format.vcodec === 'none' ||
    !isDirectHttpFormat(format)
  ) {
    return null
  }

  const extension = format.ext || format.video_ext || 'mp4'

  return {
    extension,
    id: format.format_id,
    label: `${format.height}p ${extension.toUpperCase()}`,
    type: 'video',
  }
}

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

export const mapYtDlpFormats = (
  formats: YtDlpFormat[] = [],
  requestedDownloads: YtDlpFormat[] = [],
  options: YtDlpFormatMappingOptions = {},
): DownloadFormat[] => {
  const requestedFormats = requestedDownloads
    .map(mapRequestedDownloadFormat)
    .filter((format): format is DownloadFormat => Boolean(format))

  const videoFormats = formats
    .map(mapVideoFormat)
    .filter((format): format is DownloadFormat => Boolean(format))
    .sort((first, second) => Number.parseInt(second.label) - Number.parseInt(first.label))

  const directVideoFormats = options.includeDirectVideoOnlyFormats
    ? formats
        .map(mapDirectVideoOnlyFormat)
        .filter((format): format is DownloadFormat => Boolean(format))
        .sort((first, second) => Number.parseInt(second.label) - Number.parseInt(first.label))
    : []

  const audioFormats = formats
    .map(mapAudioFormat)
    .filter((format): format is DownloadFormat => Boolean(format))
    .slice(0, 2)

  return uniqueFormats([
    ...videoFormats,
    ...directVideoFormats,
    ...requestedFormats,
    ...audioFormats,
  ]).slice(0, 8)
}

export const findSourceFormat = (metadata: YtDlpMetadata, formatId: string): YtDlpFormat | null => {
  return metadata.formats?.find((format) => format.format_id === formatId) || null
}

export const findMappedFormat = (
  metadata: YtDlpMetadata,
  formatId: string,
  options: YtDlpFormatMappingOptions = {},
): DownloadFormat | null => {
  return (
    mapYtDlpFormats(metadata.formats, metadata.requested_downloads, options).find(
      (format) => format.id === formatId,
    ) || null
  )
}

export const mapYtDlpMetadataToAnalysisResult = (
  metadata: YtDlpMetadata,
  sourceUrl: string,
  platform: DownloadPlatform,
  fallbackName: string,
  options: YtDlpFormatMappingOptions = {},
): DownloadAnalysisResult => {
  const formats = mapYtDlpFormats(metadata.formats, metadata.requested_downloads, options)

  if (!formats.length) {
    throw new YtDlpDownloaderError('NO_FORMATS_FOUND')
  }

  const selectedFormat = formats[0]

  if (!selectedFormat) {
    throw new YtDlpDownloaderError('NO_FORMATS_FOUND')
  }

  const selectedSourceFormat = findSourceFormat(metadata, selectedFormat.id)

  return {
    downloadUrl: '#',
    fileSize: formatBytes(getFormatSize(selectedSourceFormat || {})),
    filename: buildYtDlpFilename(metadata, selectedFormat, fallbackName),
    formats,
    platform,
    preview: metadata.thumbnail || '',
    quality: selectedFormat.label,
    url: sourceUrl,
  }
}
