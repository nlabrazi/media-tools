import { describe, expect, it, vi } from 'vitest'
import {
  DownloadStartError,
  buildMockDownloadStartResponse,
  downloadStartErrorMessages,
  parseDownloadStartRequest,
} from './download-start'

describe('download start', () => {
  it('normalizes and validates a start request', () => {
    expect(
      parseDownloadStartRequest({
        url: '  https://youtu.be/demo  ',
        platform: 'youtube',
        formatId: 'youtube-720p',
      }),
    ).toEqual({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      formatId: 'youtube-720p',
      format: { id: 'youtube-720p', label: '720p', type: 'video' },
    })
  })

  it('rejects unsupported formats for the requested platform', () => {
    expect(() =>
      parseDownloadStartRequest({
        url: 'https://youtu.be/demo',
        platform: 'youtube',
        formatId: 'instagram-photo-1080',
      }),
    ).toThrow(new DownloadStartError('FORMAT_UNSUPPORTED'))
  })

  it('rejects missing formats', () => {
    expect(() =>
      parseDownloadStartRequest({
        url: 'https://youtu.be/demo',
        platform: 'youtube',
      }),
    ).toThrow(new DownloadStartError('FORMAT_REQUIRED'))
  })

  it('builds a mock start response with a downloadable URL', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-30T12:00:00.000Z'))

    const response = buildMockDownloadStartResponse({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      formatId: 'youtube-mp3-320',
    })

    expect(response).toEqual({
      success: true,
      data: {
        downloadUrl:
          'data:text/plain;charset=utf-8,MediaTools%20mock%20download%0AURL%3A%20https%3A%2F%2Fyoutu.be%2Fdemo%0APlatform%3A%20youtube%0AFormat%3A%20MP3%20320kbps%0A',
        expiresAt: '2026-04-30T12:10:00.000Z',
        filename: 'youtube_youtube-mp3-320_1777550400000.mp3',
        format: { id: 'youtube-mp3-320', label: 'MP3 320kbps', type: 'audio' },
      },
    })

    vi.useRealTimers()
  })

  it('keeps every start error mapped to a user-facing message', () => {
    expect(downloadStartErrorMessages.FORMAT_REQUIRED).toBe('Format obligatoire.')
    expect(downloadStartErrorMessages.FORMAT_UNSUPPORTED).toBe('Format non supporté pour ce média.')
    expect(downloadStartErrorMessages.PLATFORM_UNSUPPORTED).toBe('Plateforme non supportée.')
    expect(downloadStartErrorMessages.URL_REQUIRED).toBe('URL obligatoire.')
    expect(downloadStartErrorMessages.INVALID_URL).toBe('URL invalide.')
    expect(downloadStartErrorMessages.UNSUPPORTED_PROTOCOL).toBe('Protocole URL non supporté.')
    expect(downloadStartErrorMessages.PLATFORM_HOST_MISMATCH).toBe(
      'Cette URL ne correspond pas à la plateforme demandée.',
    )
  })
})
