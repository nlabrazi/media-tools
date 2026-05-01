import type { DownloadPlatform } from '~/shared/types/download'
import type { DownloaderService } from './types'

export class UnsupportedDownloaderError extends Error {
  constructor(public readonly platform: DownloadPlatform) {
    super(`Downloader platform "${platform}" is not implemented.`)
  }
}

export const createUnsupportedDownloaderService = (
  platform: DownloadPlatform,
): DownloaderService => ({
  async analyze() {
    throw new UnsupportedDownloaderError(platform)
  },

  async start() {
    throw new UnsupportedDownloaderError(platform)
  },
})
