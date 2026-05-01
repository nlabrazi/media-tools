import type {
  DownloadAnalysisRequest,
  DownloadAnalysisResponse,
  DownloadStartRequest,
  DownloadStartResponse,
} from '~/shared/types/download'

export interface DownloaderServiceContext {
  ytDlpCookiesPath?: string
  ytDlpJsRuntime?: string
  ytDlpPath?: string
  ytDlpTimeoutMs?: number
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
