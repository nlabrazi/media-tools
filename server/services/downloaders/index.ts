import type { DownloadPlatform } from '~/shared/types/download'
import { mockDownloaderService } from './mock'
import type { DownloaderService } from './types'
import { youtubeDownloaderService } from './youtube'

const downloaderServices: Partial<Record<DownloadPlatform, DownloaderService>> = {
  youtube: youtubeDownloaderService,
}

export const getDownloaderService = (platform: DownloadPlatform): DownloaderService => {
  return downloaderServices[platform] || mockDownloaderService
}

export type { DownloaderService, DownloaderServiceContext } from './types'
