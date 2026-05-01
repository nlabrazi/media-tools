import type {
  DownloadAnalysisRequest,
  DownloadAnalysisResponse,
  DownloadStartRequest,
  DownloadStartResponse,
} from '~/shared/types/download'

export interface DownloaderServiceContext {
  ytDlpPath?: string
}

export interface DownloaderService {
  analyze: (
    request: DownloadAnalysisRequest,
    context?: DownloaderServiceContext,
  ) => Promise<DownloadAnalysisResponse>
  start: (
    request: DownloadStartRequest,
    context?: DownloaderServiceContext,
  ) => Promise<DownloadStartResponse>
}
