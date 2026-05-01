import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  YouTubeDownloaderError,
  analyzeYouTubeDownload,
  mapYtDlpFormats,
  mapYtDlpMetadataToAnalysisResult,
  startYouTubeDownload,
} from './youtube'

const execFileMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}))

type ExecFileCallback = (error: Error | null, stdout: string, stderr: string) => void

const formatsFixture = [
  {
    acodec: 'mp4a.40.2',
    ext: 'mp4',
    filesize: 125_829_120,
    format_id: '22',
    height: 720,
    protocol: 'https',
    vcodec: 'avc1.64001F',
  },
  {
    acodec: 'mp4a.40.2',
    ext: 'mp4',
    filesize: 41_943_040,
    format_id: '18',
    height: 360,
    protocol: 'https',
    vcodec: 'avc1.42001E',
  },
  {
    abr: 129,
    acodec: 'mp4a.40.2',
    ext: 'm4a',
    format_id: '140',
    protocol: 'https',
    vcodec: 'none',
  },
  {
    acodec: 'none',
    ext: 'mp4',
    format_id: '137',
    height: 1080,
    protocol: 'https',
    vcodec: 'avc1.640028',
  },
]

const metadataFixture = {
  formats: formatsFixture,
  thumbnail: 'https://img.youtube.com/demo.jpg',
  title: 'Demo Video!',
}

const mockYtDlpSuccess = (stdout: string) => {
  execFileMock.mockImplementation((...args: unknown[]) => {
    const callback = args.at(-1) as ExecFileCallback
    callback(null, stdout, '')
  })
}

const mockYtDlpError = (error: Error) => {
  execFileMock.mockImplementation((...args: unknown[]) => {
    const callback = args.at(-1) as ExecFileCallback
    callback(error, '', '')
  })
}

describe('youtube downloader mapping', () => {
  beforeEach(() => {
    execFileMock.mockReset()
  })

  it('maps yt-dlp formats to user-facing download formats', () => {
    expect(mapYtDlpFormats(formatsFixture)).toEqual([
      { extension: 'mp4', id: '22', label: '720p MP4', type: 'video' },
      { extension: 'mp4', id: '18', label: '360p MP4', type: 'video' },
      { extension: 'm4a', id: '140', label: 'Audio 129kbps M4A', type: 'audio' },
    ])
  })

  it('maps yt-dlp metadata to an analysis result', () => {
    expect(
      mapYtDlpMetadataToAnalysisResult(metadataFixture, 'https://youtu.be/demo'),
    ).toMatchObject({
      fileSize: '120 MB',
      filename: 'Demo_Video.mp4',
      platform: 'youtube',
      preview: 'https://img.youtube.com/demo.jpg',
      quality: '720p MP4',
      url: 'https://youtu.be/demo',
    })
  })

  it('rejects metadata without direct downloadable formats', () => {
    expect(() =>
      mapYtDlpMetadataToAnalysisResult(
        {
          formats: [
            {
              acodec: 'none',
              ext: 'mp4',
              format_id: '137',
              height: 1080,
              protocol: 'https',
              vcodec: 'avc1.640028',
            },
          ],
        },
        'https://youtu.be/demo',
      ),
    ).toThrow(new YouTubeDownloaderError('NO_FORMATS_FOUND'))
  })

  it('analyzes a YouTube URL through yt-dlp with configured executable and timeout', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      analyzeYouTubeDownload(
        {
          platform: 'youtube',
          url: 'https://youtu.be/demo',
        },
        {
          executablePath: '/usr/local/bin/yt-dlp',
          timeoutMs: 12_000,
        },
      ),
    ).resolves.toMatchObject({
      success: true,
      data: {
        filename: 'Demo_Video.mp4',
        quality: '720p MP4',
      },
    })

    expect(execFileMock).toHaveBeenCalledWith(
      '/usr/local/bin/yt-dlp',
      ['--dump-single-json', '--no-playlist', '--no-warnings', 'https://youtu.be/demo'],
      {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 12_000,
      },
      expect.any(Function),
    )
  })

  it('starts a YouTube download with a proxied stream URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startYouTubeDownload({
        formatId: '22',
        platform: 'youtube',
        url: 'https://youtu.be/demo',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        downloadUrl: expect.stringMatching(/^\/api\/download\/stream\/[a-f0-9-]+$/),
        filename: 'Demo_Video.mp4',
        format: { id: '22', label: '720p MP4' },
      },
    })

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid yt-dlp metadata', async () => {
    mockYtDlpSuccess('{invalid json')

    await expect(
      analyzeYouTubeDownload({
        platform: 'youtube',
        url: 'https://youtu.be/demo',
      }),
    ).rejects.toThrow(new YouTubeDownloaderError('INVALID_METADATA'))
  })

  it('maps yt-dlp timeout failures to a dedicated error code', async () => {
    const timeoutError = Object.assign(new Error('Command timed out'), {
      code: 'ETIMEDOUT',
    })

    mockYtDlpError(timeoutError)

    await expect(
      analyzeYouTubeDownload({
        platform: 'youtube',
        url: 'https://youtu.be/demo',
      }),
    ).rejects.toThrow(new YouTubeDownloaderError('SERVICE_TIMEOUT'))
  })

  it('rejects unsupported format ids before resolving a direct URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startYouTubeDownload({
        formatId: 'missing',
        platform: 'youtube',
        url: 'https://youtu.be/demo',
      }),
    ).rejects.toThrow(new YouTubeDownloaderError('FORMAT_NOT_FOUND'))

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })
})
