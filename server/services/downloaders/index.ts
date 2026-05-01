import type { DownloadPlatform } from '~/shared/types/download'
import { tiktokDownloaderService } from './tiktok'
import type { DownloaderService } from './types'
import { createUnsupportedDownloaderService } from './unsupported'
import { youtubeDownloaderService } from './youtube'

const downloaderServices: Partial<Record<DownloadPlatform, DownloaderService>> = {
  tiktok: tiktokDownloaderService,
  youtube: youtubeDownloaderService,
}

export const getDownloaderService = (platform: DownloadPlatform): DownloaderService => {
  return downloaderServices[platform] || createUnsupportedDownloaderService(platform)
}

export type { DownloaderService, DownloaderServiceContext } from './types'
