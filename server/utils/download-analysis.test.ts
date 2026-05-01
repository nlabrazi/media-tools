import { describe, expect, it } from 'vitest'
import {
  DownloadAnalysisError,
  buildDownloadAnalysisResponse,
  downloadAnalysisErrorMessages,
  parseDownloadAnalysisRequest,
} from './download-analysis'

describe('download analysis', () => {
  it('normalizes and validates an analysis request', () => {
    expect(
      parseDownloadAnalysisRequest({
        url: '  https://youtu.be/demo  ',
        platform: 'youtube',
        quality: '720p',
      }),
    ).toEqual({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      quality: '720p',
    })
  })

  it('rejects missing URLs', () => {
    expect(() => parseDownloadAnalysisRequest({ platform: 'youtube' })).toThrow(
      new DownloadAnalysisError('URL_REQUIRED'),
    )
  })

  it('rejects unsupported platforms', () => {
    expect(() =>
      parseDownloadAnalysisRequest({
        url: 'https://youtube.com/watch?v=demo',
        platform: 'facebook' as never,
      }),
    ).toThrow(new DownloadAnalysisError('PLATFORM_UNSUPPORTED'))
  })

  it('rejects URLs that do not match the requested platform', () => {
    expect(() =>
      parseDownloadAnalysisRequest({
        url: 'https://youtube.com/watch?v=demo',
        platform: 'instagram',
      }),
    ).toThrow(new DownloadAnalysisError('PLATFORM_HOST_MISMATCH'))
  })

  it('builds the mocked analysis response', () => {
    expect(
      buildDownloadAnalysisResponse({
        url: 'https://youtu.be/demo',
        platform: 'youtube',
      }).data,
    ).toMatchObject({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      filename: 'youtube_video_2026.mp4',
      quality: '1080p',
      formats: [
        { id: 'youtube-1080p', label: '1080p', type: 'video' },
        { id: 'youtube-720p', label: '720p', type: 'video' },
        { id: 'youtube-480p', label: '480p', type: 'video' },
        { id: 'youtube-mp3-320', label: 'MP3 320kbps', type: 'audio' },
        { id: 'youtube-mp3-128', label: 'MP3 128kbps', type: 'audio' },
      ],
    })
  })

  it('keeps every analysis error mapped to a user-facing message', () => {
    expect(downloadAnalysisErrorMessages.URL_REQUIRED).toBe('URL obligatoire.')
    expect(downloadAnalysisErrorMessages.PLATFORM_UNSUPPORTED).toBe('Plateforme non supportée.')
    expect(downloadAnalysisErrorMessages.INVALID_URL).toBe('URL invalide.')
    expect(downloadAnalysisErrorMessages.UNSUPPORTED_PROTOCOL).toBe('Protocole URL non supporté.')
    expect(downloadAnalysisErrorMessages.PLATFORM_HOST_MISMATCH).toBe(
      'Cette URL ne correspond pas à la plateforme demandée.',
    )
  })
})
