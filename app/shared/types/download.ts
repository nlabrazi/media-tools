export const downloadPlatforms = ['instagram', 'tiktok', 'youtube', 'twitter'] as const

export type DownloadPlatform = (typeof downloadPlatforms)[number]

export interface DownloadRequest {
  url: string
  platform: DownloadPlatform
  quality?: string
}

export interface DownloadFile {
  url: string
  platform: DownloadPlatform
  downloadUrl: string
  filename: string
  quality: string
  fileSize: string
}

export interface DownloadResponse {
  success: true
  data: DownloadFile
}
