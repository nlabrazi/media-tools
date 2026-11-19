import { describe, expect, it } from 'vitest'
import { createUnsupportedDownloaderService, UnsupportedDownloaderError } from './unsupported'

describe('unsupported downloader service', () => {
  it('throws UnsupportedDownloaderError for analyze and start', async () => {
    const service = createUnsupportedDownloaderService('youtube')

    await expect(service.analyze({ url: 'https://example.test' } as never)).rejects.toThrow(
      UnsupportedDownloaderError,
    )
    await expect(service.start({ url: 'https://example.test' } as never)).rejects.toThrow(
      'Downloader platform "youtube" is not implemented.',
    )

    const err = new UnsupportedDownloaderError('tiktok')
    expect(err.platform).toBe('tiktok')
  })
})
