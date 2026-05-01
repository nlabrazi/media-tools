import type {
  DownloadAnalysisRequest,
  DownloadAnalysisResponse,
  DownloadAnalysisResult,
  DownloadFormat,
  DownloadPlatform,
} from '~/shared/types/download'
import { findDownloadFormat, getDefaultDownloadFormat } from './download-format'

type MockDownloadPreset = Pick<DownloadAnalysisResult, 'preview' | 'filename' | 'fileSize'> & {
  formats: DownloadFormat[]
}

const mockDownloadPresets: Record<DownloadPlatform, MockDownloadPreset> = {
  instagram: {
    preview: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=400&fit=crop',
    filename: 'instagram_photo_2026.jpg',
    formats: [
      { id: 'instagram-photo-1080', label: 'Photo 1080x1350', type: 'image' },
      { id: 'instagram-video-1080p', label: 'Video 1080p', type: 'video' },
    ],
    fileSize: '2.4 MB',
  },
  tiktok: {
    preview: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=600&fit=crop',
    filename: 'tiktok_video_2026.mp4',
    formats: [
      { id: 'tiktok-1080p-no-watermark', label: '1080p (sans watermark)', type: 'video' },
      { id: 'tiktok-1080p-watermark', label: '1080p (avec watermark)', type: 'video' },
      { id: 'tiktok-audio-mp3', label: 'Audio MP3', type: 'audio' },
    ],
    fileSize: '15.7 MB',
  },
  youtube: {
    preview: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop',
    filename: 'youtube_video_2026.mp4',
    formats: [
      { id: 'youtube-1080p', label: '1080p', type: 'video' },
      { id: 'youtube-720p', label: '720p', type: 'video' },
      { id: 'youtube-480p', label: '480p', type: 'video' },
      { id: 'youtube-mp3-320', label: 'MP3 320kbps', type: 'audio' },
      { id: 'youtube-mp3-128', label: 'MP3 128kbps', type: 'audio' },
    ],
    fileSize: '128 MB',
  },
  twitter: {
    preview: 'https://images.unsplash.com/photo-1611605698335-53a9e1b0e1f7?w=400&h=400&fit=crop',
    filename: 'twitter_video_2026.mp4',
    formats: [
      { id: 'twitter-video-mp4', label: 'Video MP4', type: 'video' },
      { id: 'twitter-gif', label: 'GIF', type: 'gif' },
    ],
    fileSize: '8.2 MB',
  },
}

export const getMockDownloadFormats = (platform: DownloadPlatform): DownloadFormat[] => {
  return mockDownloadPresets[platform].formats
}

export const buildMockDownloadAnalysisResponse = (
  request: DownloadAnalysisRequest,
): DownloadAnalysisResponse => {
  const preset = mockDownloadPresets[request.platform]
  const selectedFormat =
    findDownloadFormat(preset.formats, request.quality) || getDefaultDownloadFormat(preset.formats)

  return {
    success: true,
    data: {
      url: request.url,
      preview: preset.preview,
      platform: request.platform,
      downloadUrl: '#',
      filename: preset.filename,
      quality: selectedFormat?.label || '',
      formats: preset.formats,
      fileSize: preset.fileSize,
    },
  }
}

export const buildMockDownloadResponse = buildMockDownloadAnalysisResponse
