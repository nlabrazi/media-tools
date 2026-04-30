/*
  Logique de téléchargement partagée.
  Pour la V1 : appelle l'API Nuxt qui retourne encore un mock serveur.
*/
import type { Tool } from '~/data/tools'
import type { DownloadPlatform, DownloadResponse } from '~/shared/types/download'
import { getDownloadErrorMessage } from '~/shared/utils/download-error'
import { assertValidUrlForPlatform, isDownloadPlatform } from '~/shared/utils/download-validation'
import type { Notification } from './useNotification'
import { useNotification } from './useNotification'

export type DownloadResult = DownloadResponse['data']

export const useDownloader = (tool: Ref<Tool>) => {
  const url = ref('')
  const isLoading = ref(false)
  const result = ref<DownloadResult | null>(null)
  const error = ref<string | null>(null)
  const selectedQuality = ref('')

  const { addNotification } = useNotification()

  const validateUrl = (inputUrl: string): boolean => {
    if (!isDownloadPlatform(tool.value.id)) {
      return false
    }

    try {
      assertValidUrlForPlatform(inputUrl, tool.value.id)
      return true
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

    try {
      const response = await $fetch<DownloadResponse>('/api/download', {
        method: 'POST',
        body: {
          url: url.value,
          platform: tool.value.id as DownloadPlatform,
          quality: selectedQuality.value || undefined,
        },
      })

      result.value = response.data
      addNotification({ type: 'success', message: 'Média trouvé ! Choisissez la qualité.' })
    } catch (requestError) {
      error.value = getDownloadErrorMessage(requestError)
      addNotification({ type: 'error', message: error.value })
    } finally {
      isLoading.value = false
      removeNotificationFromComposable()
    }
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
