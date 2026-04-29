/*
  Placeholder pour le futur backend de téléchargement.
  Actuellement, retourne un mock. À remplacer par le vrai téléchargement.
*/
export default defineEventHandler(async (event) => {
  const body = await readBody<{ url: string; platform: string; quality?: string }>(event)

  // Simulation de temps de traitement
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock response
  return {
    success: true,
    data: {
      url: body.url,
      platform: body.platform,
      downloadUrl: '#',
      filename: `media_${Date.now()}.mp4`,
      quality: body.quality || '1080p',
      fileSize: '15.7 MB'
    }
  }
})
