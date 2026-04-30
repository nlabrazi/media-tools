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
        formats: [
          { id: 'youtube-1080p', label: '1080p', type: 'video' },
          { id: 'youtube-720p', label: '720p', type: 'video' },
          { id: 'youtube-480p', label: '480p', type: 'video' },
          { id: 'youtube-mp3-320', label: 'MP3 320kbps', type: 'audio' },
          { id: 'youtube-mp3-128', label: 'MP3 128kbps', type: 'audio' },
        ],
        fileSize: '128 MB',
      },
    })
  })

  it('keeps the requested quality when one is provided', () => {
    const response = buildMockDownloadResponse({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      quality: 'youtube-720p',
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
      quality: 'Photo 1080x1350',
      formats: [
        { id: 'instagram-photo-1080', label: 'Photo 1080x1350', type: 'image' },
        { id: 'instagram-video-1080p', label: 'Video 1080p', type: 'video' },
      ],
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
      formats: [
        { id: 'tiktok-1080p-no-watermark', label: '1080p (sans watermark)', type: 'video' },
        { id: 'tiktok-1080p-watermark', label: '1080p (avec watermark)', type: 'video' },
        { id: 'tiktok-audio-mp3', label: 'Audio MP3', type: 'audio' },
      ],
      fileSize: '15.7 MB',
    })

    expect(
      buildMockDownloadResponse({
        url: 'https://x.com/user/status/1',
        platform: 'twitter',
      }).data,
    ).toMatchObject({
      filename: 'twitter_video_2026.mp4',
      quality: 'Video MP4',
      formats: [
        { id: 'twitter-video-mp4', label: 'Video MP4', type: 'video' },
        { id: 'twitter-gif', label: 'GIF', type: 'gif' },
      ],
      fileSize: '8.2 MB',
    })
  })
})
