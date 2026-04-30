/*
  Logique de téléchargement partagée.
  Pour la V1 : mock seulement. À connecter au backend plus tard.
*/
import type { Tool } from '~/data/tools'
import type { Notification } from './useNotification'
import { useNotification } from './useNotification'

export interface DownloadResult {
  url: string
  preview: string
  filename: string
  quality: string
  fileSize: string
}

export const useDownloader = (tool: Ref<Tool>) => {
  const url = ref('')
  const isLoading = ref(false)
  const result = ref<DownloadResult | null>(null)
  const error = ref<string | null>(null)
  const selectedQuality = ref('')

  const { addNotification } = useNotification()

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const parsed = new URL(inputUrl)
      const hostname = parsed.hostname.replace('www.', '')

      switch (tool.value.id) {
        case 'instagram':
          return hostname === 'instagram.com'
        case 'tiktok':
          return hostname === 'tiktok.com' || hostname === 'vm.tiktok.com'
        case 'youtube':
          return hostname === 'youtube.com' || hostname === 'youtu.be'
        case 'twitter':
          return hostname === 'twitter.com' || hostname === 'x.com'
        default:
          return false
      }
    } catch {
      return false
    }
  }

  const fetchInfo = async () => {
    error.value = null
    result.value = null

    if (!url.value.trim()) {
      error.value = 'Veuillez entrer une URL.'
      return
    }

    if (!validateUrl(url.value)) {
      error.value = `URL ${tool.value.name} invalide. Vérifiez le format.`
      return
    }

    isLoading.value = true
    addNotification({ type: 'loading', message: 'Analyse du lien en cours...', duration: 0 })

    /*
      SIMULATION FRONTEND (V1)
      En production, appel à $fetch('/api/download', { method: 'POST', body: { url: url.value, platform: tool.value.id } })
    */
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock result
    const mockResults: Record<string, DownloadResult> = {
      instagram: {
        url: '#',
        preview:
          'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=400&fit=crop',
        filename: 'instagram_photo_2026.jpg',
        quality: '1080x1350',
        fileSize: '2.4 MB',
      },
      tiktok: {
        url: '#',
        preview:
          'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=600&fit=crop',
        filename: 'tiktok_video_2026.mp4',
        quality: '1080p (sans watermark)',
        fileSize: '15.7 MB',
      },
      youtube: {
        url: '#',
        preview:
          'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop',
        filename: 'youtube_video_2026.mp4',
        quality: '1080p',
        fileSize: '128 MB',
      },
      twitter: {
        url: '#',
        preview:
          'https://images.unsplash.com/photo-1611605698335-53a9e1b0e1f7?w=400&h=400&fit=crop',
        filename: 'twitter_video_2026.mp4',
        quality: '720p',
        fileSize: '8.2 MB',
      },
    }

    result.value = mockResults[tool.value.id] || null
    isLoading.value = false

    removeNotificationFromComposable()
    addNotification({ type: 'success', message: 'Média trouvé ! Choisissez la qualité.' })
  }

  const removeNotificationFromComposable = () => {
    // Accès au state partagé
    const { removeNotification: remove } = useNotification()
    const notifs = useState<Notification[]>('notifications')
    const loadingNotif = notifs.value.find((n) => n.type === 'loading')
    if (loadingNotif) remove(loadingNotif.id)
  }

  const resetForm = () => {
    url.value = ''
    result.value = null
    error.value = null
    selectedQuality.value = ''
  }

  return {
    url,
    isLoading,
    result,
    error,
    selectedQuality,
    fetchInfo,
    resetForm,
    validateUrl,
  }
}
