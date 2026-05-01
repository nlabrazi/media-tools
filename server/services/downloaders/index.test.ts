import { describe, expect, it } from 'vitest'
import type { DownloadPlatform } from '~/shared/types/download'
import { getDownloaderService } from '.'
import { tiktokDownloaderService } from './tiktok'
import { twitterDownloaderService } from './twitter'
import { UnsupportedDownloaderError } from './unsupported'
import { youtubeDownloaderService } from './youtube'

describe('downloader service registry', () => {
  it('uses the real YouTube downloader service for YouTube requests', () => {
    expect(getDownloaderService('youtube')).toBe(youtubeDownloaderService)
  })

  it('uses the real TikTok downloader service for TikTok requests', () => {
    expect(getDownloaderService('tiktok')).toBe(tiktokDownloaderService)
  })

  it('uses the real Twitter/X downloader service for Twitter requests', () => {
    expect(getDownloaderService('twitter')).toBe(twitterDownloaderService)
  })

  it.each<DownloadPlatform>(['instagram'])(
    'returns an explicit unsupported downloader service for %s requests',
    async (platform) => {
      const service = getDownloaderService(platform)

      await expect(
        service.analyze({
          url: `https://www.${platform}.com/demo`,
          platform,
        }),
      ).rejects.toThrow(new UnsupportedDownloaderError(platform))
    },
  )

  it('rejects unsupported start requests with the same platform error', async () => {
    await expect(
      getDownloaderService('instagram').start({
        url: 'https://www.instagram.com/p/demo',
        platform: 'instagram',
        formatId: 'instagram-photo-1080',
      }),
    ).rejects.toThrow(new UnsupportedDownloaderError('instagram'))
  })
})
