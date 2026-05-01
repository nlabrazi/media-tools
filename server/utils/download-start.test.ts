import { describe, expect, it } from 'vitest'
import {
  DownloadStartError,
  downloadStartErrorMessages,
  parseDownloadStartBaseRequest,
} from './download-start'

describe('download start', () => {
  it('normalizes and validates a start request', () => {
    expect(
      parseDownloadStartBaseRequest({
        url: '  https://youtu.be/demo  ',
        platform: 'youtube',
        formatId: '22',
      }),
    ).toEqual({
      url: 'https://youtu.be/demo',
      platform: 'youtube',
      formatId: '22',
    })
  })

  it('rejects missing formats', () => {
    expect(() =>
      parseDownloadStartBaseRequest({
        url: 'https://youtu.be/demo',
        platform: 'youtube',
      }),
    ).toThrow(new DownloadStartError('FORMAT_REQUIRED'))
  })

  it('keeps every start error mapped to a user-facing message', () => {
    expect(downloadStartErrorMessages.FORMAT_REQUIRED).toBe('Format obligatoire.')
    expect(downloadStartErrorMessages.PLATFORM_UNSUPPORTED).toBe('Plateforme non supportée.')
    expect(downloadStartErrorMessages.URL_REQUIRED).toBe('URL obligatoire.')
    expect(downloadStartErrorMessages.INVALID_URL).toBe('URL invalide.')
    expect(downloadStartErrorMessages.UNSUPPORTED_PROTOCOL).toBe('Protocole URL non supporté.')
    expect(downloadStartErrorMessages.PLATFORM_HOST_MISMATCH).toBe(
      'Cette URL ne correspond pas à la plateforme demandée.',
    )
  })
})
