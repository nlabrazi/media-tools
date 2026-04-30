import type { DownloadRequest, DownloadResponse } from '~/shared/types/download'

const previewByPlatform: Record<DownloadRequest['platform'], string> = {
  instagram: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=400&fit=crop',
  tiktok: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=600&fit=crop',
  youtube: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop',
  twitter: 'https://images.unsplash.com/photo-1611605698335-53a9e1b0e1f7?w=400&h=400&fit=crop',
}

export const buildMockDownloadResponse = (request: DownloadRequest): DownloadResponse => {
  return {
    success: true,
    data: {
      url: request.url,
      preview: previewByPlatform[request.platform],
      platform: request.platform,
      downloadUrl: '#',
      filename: `media_${Date.now()}.mp4`,
      quality: request.quality || '1080p',
      fileSize: '15.7 MB',
    },
  }
}
