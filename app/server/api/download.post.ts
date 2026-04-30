/*
  Placeholder pour le futur backend de téléchargement.
  Actuellement, valide la requête puis retourne un mock.
  À remplacer par le vrai service de téléchargement.
*/
import {
  type DownloadPlatform,
  type DownloadRequest,
  type DownloadResponse,
  downloadPlatforms,
} from '~/shared/types/download'

const platformHosts: Record<DownloadPlatform, string[]> = {
  instagram: ['instagram.com'],
  tiktok: ['tiktok.com', 'vm.tiktok.com'],
  youtube: ['youtube.com', 'youtu.be'],
  twitter: ['twitter.com', 'x.com'],
}

const isDownloadPlatform = (platform: unknown): platform is DownloadPlatform => {
  return typeof platform === 'string' && downloadPlatforms.includes(platform as DownloadPlatform)
}

const normalizeHostname = (hostname: string) => hostname.replace(/^www\./, '')

const assertValidUrlForPlatform = (url: string, platform: DownloadPlatform) => {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL invalide.',
    })
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Protocole URL non supporté.',
    })
  }

  const hostname = normalizeHostname(parsedUrl.hostname)

  if (!platformHosts[platform].includes(hostname)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cette URL ne correspond pas à la plateforme demandée.',
    })
  }
}

export default defineEventHandler(async (event): Promise<DownloadResponse> => {
  const body = await readBody<Partial<DownloadRequest>>(event)

  if (typeof body.url !== 'string' || !body.url.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL obligatoire.',
    })
  }

  if (!isDownloadPlatform(body.platform)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Plateforme non supportée.',
    })
  }

  const cleanUrl = body.url.trim()
  assertValidUrlForPlatform(cleanUrl, body.platform)

  // Simulation de temps de traitement
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock response
  return {
    success: true,
    data: {
      url: cleanUrl,
      platform: body.platform,
      downloadUrl: '#',
      filename: `media_${Date.now()}.mp4`,
      quality: body.quality || '1080p',
      fileSize: '15.7 MB',
    },
  }
})
