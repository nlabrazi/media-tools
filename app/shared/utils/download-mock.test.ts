import { describe, expect, it } from 'vitest'
import { buildMockDownloadResponse } from './download-mock'

describe('download mock response', () => {
  it('builds a platform-specific mocked API response expected by the downloader UI', () => {
    const response = buildMockDownloadResponse({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
    })

    expect(response).toEqual({
      success: true,
      data: {
        url: 'https://youtu.be/demo',
        preview:
          'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop',
        platform: 'youtube',
        downloadUrl: '#',
        filename: 'youtube_video_2026.mp4',
        quality: '1080p',
        fileSize: '128 MB',
      },
    })
  })

  it('keeps the requested quality when one is provided', () => {
    const response = buildMockDownloadResponse({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      quality: '720p',
    })

    expect(response.data.quality).toBe('720p')
  })

  it('uses a different preset for each platform', () => {
    expect(
      buildMockDownloadResponse({
        url: 'https://instagram.com/p/demo',
        platform: 'instagram',
      }).data,
    ).toMatchObject({
      filename: 'instagram_photo_2026.jpg',
      quality: '1080x1350',
      fileSize: '2.4 MB',
    })

    expect(
      buildMockDownloadResponse({
        url: 'https://vm.tiktok.com/demo',
        platform: 'tiktok',
      }).data,
    ).toMatchObject({
      filename: 'tiktok_video_2026.mp4',
      quality: '1080p (sans watermark)',
      fileSize: '15.7 MB',
    })

    expect(
      buildMockDownloadResponse({
        url: 'https://x.com/user/status/1',
        platform: 'twitter',
      }).data,
    ).toMatchObject({
      filename: 'twitter_video_2026.mp4',
      quality: '720p',
      fileSize: '8.2 MB',
    })
  })
})
