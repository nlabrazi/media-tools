import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TwitterDownloaderError, analyzeTwitterDownload, startTwitterDownload } from './twitter'

const execFileMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}))

type ExecFileCallback = (error: Error | null, stdout: string, stderr: string) => void

const formatsFixture = [
  {
    acodec: 'aac',
    ext: 'mp4',
    filesize: 6_291_456,
    format_id: 'http-832',
    height: 720,
    protocol: 'https',
    vcodec: 'avc1.64001f',
  },
  {
    acodec: 'aac',
    ext: 'mp4',
    filesize: 2_097_152,
    format_id: 'http-256',
    height: 360,
    protocol: 'https',
    vcodec: 'avc1.42001e',
  },
]

const metadataFixture = {
  formats: formatsFixture,
  thumbnail: 'https://pbs.twimg.com/ext_tw_video_thumb/demo.jpg',
  title: 'Twitter Demo',
}

const splitFormatsMetadataFixture = {
  formats: [
    {
      abr: 128,
      acodec: 'mp4a.40.2',
      ext: 'mp4',
      format_id: 'hls-audio-128000-Audio',
      protocol: 'm3u8_native',
      vcodec: 'none',
    },
    {
      acodec: 'none',
      ext: 'mp4',
      format_id: 'hls-816-1',
      height: 1024,
      protocol: 'm3u8_native',
      vcodec: 'avc1.64001F',
      width: 576,
    },
    {
      ext: 'mp4',
      filesize_approx: 18_047_328,
      format_id: 'http-1664',
      height: 1024,
      protocol: 'https',
      width: 576,
    },
  ],
  requested_downloads: [
    {
      ext: 'mp4',
      format_id: 'hls-816-1+hls-audio-128000-Audio',
      height: 1024,
      protocol: 'm3u8_native+m3u8_native',
      width: 576,
    },
  ],
  thumbnail: 'https://pbs.twimg.com/ext_tw_video_thumb/demo.jpg',
  title: 'Twitter Split Demo',
}

const mockYtDlpSuccess = (stdout: string) => {
  execFileMock.mockImplementation((...args: unknown[]) => {
    const callback = args.at(-1) as ExecFileCallback
    callback(null, stdout, '')
  })
}

describe('twitter downloader', () => {
  beforeEach(() => {
    execFileMock.mockReset()
  })

  it('analyzes a Twitter/X URL through yt-dlp', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      analyzeTwitterDownload({
        platform: 'twitter',
        url: 'https://x.com/user/status/12345',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        fileSize: '6.0 MB',
        filename: 'Twitter_Demo.mp4',
        platform: 'twitter',
        preview: 'https://pbs.twimg.com/ext_tw_video_thumb/demo.jpg',
        quality: '720p MP4',
      },
    })
  })

  it('starts a Twitter/X download with a proxied stream URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startTwitterDownload({
        formatId: 'http-832',
        platform: 'twitter',
        url: 'https://x.com/user/status/12345',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        downloadUrl: expect.stringMatching(/^\/api\/download\/stream\/[a-f0-9-]+$/),
        filename: 'Twitter_Demo.mp4',
        format: { id: 'http-832', label: '720p MP4' },
      },
    })

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })

  it('prefers direct MP4 formats when Twitter also exposes fragile split HLS streams', async () => {
    mockYtDlpSuccess(JSON.stringify(splitFormatsMetadataFixture))

    await expect(
      analyzeTwitterDownload({
        platform: 'twitter',
        url: 'https://x.com/hamzinzin/status/1758531866200584241',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        fileSize: '17 MB',
        filename: 'Twitter_Split_Demo.mp4',
        formats: [
          {
            extension: 'mp4',
            id: 'http-1664',
            label: '1024p MP4',
            type: 'video',
          },
        ],
        platform: 'twitter',
        quality: '1024p MP4',
      },
    })
  })

  it('rejects unsupported Twitter/X format ids before creating a stream URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startTwitterDownload({
        formatId: 'missing',
        platform: 'twitter',
        url: 'https://x.com/user/status/12345',
      }),
    ).rejects.toThrow(new TwitterDownloaderError('FORMAT_NOT_FOUND'))

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })
})
