import type {
  DownloadFile,
  DownloadPlatform,
  DownloadRequest,
  DownloadResponse,
} from '~/shared/types/download'

type MockDownloadPreset = Pick<DownloadFile, 'preview' | 'filename' | 'quality' | 'fileSize'>

const mockDownloadPresets: Record<DownloadPlatform, MockDownloadPreset> = {
  instagram: {
    preview: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=400&fit=crop',
    filename: 'instagram_photo_2026.jpg',
    quality: '1080x1350',
    fileSize: '2.4 MB',
  },
  tiktok: {
    preview: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=600&fit=crop',
    filename: 'tiktok_video_2026.mp4',
    quality: '1080p (sans watermark)',
    fileSize: '15.7 MB',
  },
  youtube: {
    preview: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop',
    filename: 'youtube_video_2026.mp4',
    quality: '1080p',
    fileSize: '128 MB',
  },
  twitter: {
    preview: 'https://images.unsplash.com/photo-1611605698335-53a9e1b0e1f7?w=400&h=400&fit=crop',
    filename: 'twitter_video_2026.mp4',
    quality: '720p',
    fileSize: '8.2 MB',
  },
}

export const buildMockDownloadResponse = (request: DownloadRequest): DownloadResponse => {
  const preset = mockDownloadPresets[request.platform]

  return {
    success: true,
    data: {
      url: request.url,
      preview: preset.preview,
      platform: request.platform,
      downloadUrl: '#',
      filename: preset.filename,
      quality: request.quality || preset.quality,
      fileSize: preset.fileSize,
    },
  }
}
