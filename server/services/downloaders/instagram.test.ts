import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  InstagramDownloaderError,
  analyzeInstagramDownload,
  startInstagramDownload,
} from './instagram'

const execFileMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}))

type ExecFileCallback = (error: Error | null, stdout: string, stderr: string) => void

const formatsFixture = [
  {
    ext: 'mp4',
    filesize_approx: 12_582_912,
    format_id: 'dash-720',
    height: 720,
    protocol: 'https',
    url: 'https://scontent.cdninstagram.com/demo.mp4',
    width: 720,
  },
  {
    acodec: 'none',
    ext: 'mp4',
    format_id: 'dash-480-video-only',
    height: 480,
    protocol: 'https',
    vcodec: 'avc1.64001f',
    width: 480,
  },
]

const metadataFixture = {
  formats: formatsFixture,
  thumbnail: 'https://scontent.cdninstagram.com/demo.jpg',
  title: 'Instagram Reel Demo',
}

const mockYtDlpSuccess = (stdout: string) => {
  execFileMock.mockImplementation((...args: unknown[]) => {
    const callback = args.at(-1) as ExecFileCallback
    callback(null, stdout, '')
  })
}

describe('instagram downloader', () => {
  beforeEach(() => {
    execFileMock.mockReset()
  })

  it('analyzes an Instagram URL through yt-dlp', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      analyzeInstagramDownload({
        platform: 'instagram',
        url: 'https://www.instagram.com/reel/demo',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        fileSize: '12 MB',
        filename: 'Instagram_Reel_Demo.mp4',
        platform: 'instagram',
        preview: 'https://scontent.cdninstagram.com/demo.jpg',
        quality: '720p MP4',
      },
    })
  })

  it('starts an Instagram download with a proxied stream URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startInstagramDownload({
        formatId: 'dash-720',
        platform: 'instagram',
        url: 'https://www.instagram.com/reel/demo',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        downloadUrl: expect.stringMatching(/^\/api\/download\/stream\/[a-f0-9-]+$/),
        filename: 'Instagram_Reel_Demo.mp4',
        format: { id: 'dash-720', label: '720p MP4' },
      },
    })

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })

  it('rejects unsupported Instagram format ids before creating a stream URL', async () => {
    mockYtDlpSuccess(JSON.stringify(metadataFixture))

    await expect(
      startInstagramDownload({
        formatId: 'missing',
        platform: 'instagram',
        url: 'https://www.instagram.com/reel/demo',
      }),
    ).rejects.toThrow(new InstagramDownloaderError('FORMAT_NOT_FOUND'))

    expect(execFileMock).toHaveBeenCalledTimes(1)
  })
})
