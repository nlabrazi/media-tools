import { buildDownloadAnalysisResponse } from '~/server/utils/download-analysis'
import { buildMockDownloadStartResponse } from '~/server/utils/download-start'
import type { DownloaderService } from './types'

export const mockDownloaderService: DownloaderService = {
  async analyze(request) {
    return buildDownloadAnalysisResponse(request)
  },

  async start(request) {
    return buildMockDownloadStartResponse(request)
  },
}
