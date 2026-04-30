import type { DownloadFormat, DownloadPlatform } from '~/shared/types/download'

const extensionByFormatType: Record<DownloadFormat['type'], string> = {
  audio: 'mp3',
  gif: 'gif',
  image: 'jpg',
  video: 'mp4',
}

export const buildDownloadFilename = (
  platform: DownloadPlatform,
  format: DownloadFormat,
  timestamp = Date.now(),
): string => {
  return `${platform}_${format.id}_${timestamp}.${extensionByFormatType[format.type]}`
}
