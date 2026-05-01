import type { DownloadPlatform } from '~/shared/types/download'
import type { DownloaderService } from './types'
import { createUnsupportedDownloaderService } from './unsupported'
import { youtubeDownloaderService } from './youtube'

const downloaderServices: Partial<Record<DownloadPlatform, DownloaderService>> = {
  youtube: youtubeDownloaderService,
}

export const getDownloaderService = (platform: DownloadPlatform): DownloaderService => {
  return downloaderServices[platform] || createUnsupportedDownloaderService(platform)
}

export type { DownloaderService, DownloaderServiceContext } from './types'
