import { describe, expect, it } from 'vitest'
import type { DownloadPlatform } from '~/shared/types/download'
import { getDownloaderService } from '.'
import { mockDownloaderService } from './mock'
import { youtubeDownloaderService } from './youtube'

describe('downloader service registry', () => {
  it('uses the real YouTube downloader service for YouTube requests', () => {
    expect(getDownloaderService('youtube')).toBe(youtubeDownloaderService)
  })

  it.each<DownloadPlatform>(['instagram', 'tiktok', 'twitter'])(
    'falls back to the mock downloader service for %s requests',
    (platform) => {
      expect(getDownloaderService(platform)).toBe(mockDownloaderService)
    },
  )

  it('keeps the fallback service compatible with the downloader contract', async () => {
    const analysis = await getDownloaderService('instagram').analyze({
      url: 'https://www.instagram.com/p/demo',
      platform: 'instagram',
    })

    expect(analysis).toMatchObject({
      success: true,
      data: {
        platform: 'instagram',
        url: 'https://www.instagram.com/p/demo',
      },
    })

    const start = await getDownloaderService('instagram').start({
      url: 'https://www.instagram.com/p/demo',
      platform: 'instagram',
      formatId: analysis.data.formats[0]?.id || '',
    })

    expect(start).toMatchObject({
      success: true,
      data: {
        format: analysis.data.formats[0],
      },
    })
  })
})
