import { describe, expect, it, vi } from 'vitest'
import { buildMockDownloadResponse } from './download-mock'

describe('download mock response', () => {
  it('builds the mocked API response expected by the downloader UI', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-30T12:00:00.000Z'))

    const response = buildMockDownloadResponse({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      quality: '720p',
    })

    expect(response).toEqual({
      success: true,
      data: {
        url: 'https://youtu.be/demo',
        preview:
          'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop',
        platform: 'youtube',
        downloadUrl: '#',
        filename: 'media_1777550400000.mp4',
        quality: '720p',
        fileSize: '15.7 MB',
      },
    })

    vi.useRealTimers()
  })
})
