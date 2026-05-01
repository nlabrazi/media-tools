/*
  Définition des outils de téléchargement disponibles.
*/
export interface Tool {
  id: string
  name: string
  icon: string
  color: string
  description: string
  route: string
  supportedFormats: string[]
  placeholder: string
}

export const tools: Tool[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: '#ff2d95',
    description: 'Photos, vidéos, stories, reels et IGTV.',
    route: '/downloader/instagram',
    supportedFormats: ['Photo', 'Video', 'Reel', 'Story', 'Carousel'],
    placeholder: 'https://www.instagram.com/p/... ou https://www.instagram.com/reel/...',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#00d4ff',
    description: 'Vidéos sans watermark en HD.',
    route: '/downloader/tiktok',
    supportedFormats: ['Video (sans watermark)', 'Video (avec watermark)', 'Audio (MP3)'],
    placeholder: 'https://www.tiktok.com/@user/video/... ou https://vm.tiktok.com/...',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#ff0000',
    description: 'Vidéos en MP4, audio en MP3.',
    route: '/downloader/youtube',
    supportedFormats: ['MP4 1080p', 'MP4 720p', 'MP4 480p', 'MP3 320kbps', 'MP3 128kbps'],
    placeholder: 'https://www.youtube.com/watch?v=... ou https://youtu.be/...',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    color: '#1da1f2',
    description: 'Vidéos et GIFs depuis les tweets.',
    route: '/downloader/twitter',
    supportedFormats: ['Video MP4', 'GIF'],
    placeholder: 'https://twitter.com/user/status/... ou https://x.com/user/status/...',
  },
]

export const findToolById = (id: Tool['id']): Tool => {
  const tool = tools.find((item) => item.id === id)

  if (!tool) {
    throw new Error(`Tool "${id}" is not configured.`)
  }

  return tool
}
