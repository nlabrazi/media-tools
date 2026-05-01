import type { DownloadPlatform } from '~/shared/types/download'
import { instagramDownloaderService } from './instagram'
import { tiktokDownloaderService } from './tiktok'
import { twitterDownloaderService } from './twitter'
import type { DownloaderService } from './types'
import { createUnsupportedDownloaderService } from './unsupported'
import { youtubeDownloaderService } from './youtube'

const downloaderServices: Partial<Record<DownloadPlatform, DownloaderService>> = {
  instagram: instagramDownloaderService,
  tiktok: tiktokDownloaderService,
  twitter: twitterDownloaderService,
  youtube: youtubeDownloaderService,
}

export const getDownloaderService = (platform: DownloadPlatform): DownloaderService => {
  return downloaderServices[platform] || createUnsupportedDownloaderService(platform)
}

export type { DownloaderService, DownloaderServiceContext } from './types'
