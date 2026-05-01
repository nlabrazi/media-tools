import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TikTokDownloaderError, analyzeTikTokDownload, startTikTokDownload } from './tiktok'

const execFileMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}))

type ExecFileCallback = (error: Error | null, stdout: string, stderr: string) => void

const formatsFixture = [
  {
    acodec: 'aac',
    ext: 'mp4',
    filesize_approx: 9_437_184,
    format_id: 'bytevc1_720p_12345',
    height: 720,
    protocol: 'https',
    vcodec: 'h265',
  },
  {
    abr: 128,
    acodec: 'aac',
    ext: 'm4a',
    format_id: 'audio_128',
    protocol: 'https',
    vcodec: 'none',
  },
]

const metadataFixture = {
  formats: formatsFixture,
  thumbnail: 'https://p16-sign-va.tiktokcdn.com/demo.jpeg',
  title: 'TikTok Demo',
}

const mockYtDlpSuccess = (stdout: string) => {
  execFileMock.mockImplementation((...args: unknown[]) => {
    const callback = args.at(-1) as ExecFileCallback
    callback(null, stdout, '')
  })
}

describe('tiktok downloader', () => {
  beforeEach(() => {
    execFileMock.mockReset()
  })

  it('analyzes a TikTok URL through yt-dlp', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      analyzeTikTokDownload({
        platform: 'tiktok',
        url: 'https://www.tiktok.com/@user/video/12345',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        fileSize: '9.0 MB',
        filename: 'TikTok_Demo.mp4',
        platform: 'tiktok',
        preview: 'https://p16-sign-va.tiktokcdn.com/demo.jpeg',
        quality: '720p MP4',
      },
    })
  })

  it('starts a TikTok download with a proxied stream URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startTikTokDownload({
        formatId: 'bytevc1_720p_12345',
        platform: 'tiktok',
        url: 'https://www.tiktok.com/@user/video/12345',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        downloadUrl: expect.stringMatching(/^\/api\/download\/stream\/[a-f0-9-]+$/),
        filename: 'TikTok_Demo.mp4',
        format: { id: 'bytevc1_720p_12345', label: '720p MP4' },
      },
    })

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })

  it('rejects unsupported TikTok format ids before resolving a direct URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startTikTokDownload({
        formatId: 'missing',
        platform: 'tiktok',
        url: 'https://www.tiktok.com/@user/video/12345',
      }),
    ).rejects.toThrow(new TikTokDownloaderError('FORMAT_NOT_FOUND'))

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })
})
