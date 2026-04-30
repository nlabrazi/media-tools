export const downloadPlatforms = ['instagram', 'tiktok', 'youtube', 'twitter'] as const

export type DownloadPlatform = (typeof downloadPlatforms)[number]

export interface DownloadRequest {
  url: string
  platform: DownloadPlatform
  quality?: string
}

export interface DownloadFormat {
  id: string
  label: string
  type: 'audio' | 'gif' | 'image' | 'video'
}

export interface DownloadFile {
  url: string
  preview: string
  platform: DownloadPlatform
  downloadUrl: string
  filename: string
  quality: string
  formats: DownloadFormat[]
  fileSize: string
}

export interface DownloadResponse {
  success: true
  data: DownloadFile
}
