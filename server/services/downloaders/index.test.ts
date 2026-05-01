import { describe, expect, it } from 'vitest'
import { getDownloaderService } from '.'
import { instagramDownloaderService } from './instagram'
import { tiktokDownloaderService } from './tiktok'
import { twitterDownloaderService } from './twitter'
import { youtubeDownloaderService } from './youtube'

describe('downloader service registry', () => {
  it('uses the real Instagram downloader service for Instagram requests', () => {
    expect(getDownloaderService('instagram')).toBe(instagramDownloaderService)
  })

  it('uses the real YouTube downloader service for YouTube requests', () => {
    expect(getDownloaderService('youtube')).toBe(youtubeDownloaderService)
  })

  it('uses the real TikTok downloader service for TikTok requests', () => {
    expect(getDownloaderService('tiktok')).toBe(tiktokDownloaderService)
  })

  it('uses the real Twitter/X downloader service for Twitter requests', () => {
    expect(getDownloaderService('twitter')).toBe(twitterDownloaderService)
  })
})
