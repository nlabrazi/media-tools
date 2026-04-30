/*
  Logique de téléchargement partagée.
  Pour la V1 : appelle l'API Nuxt qui retourne encore un mock serveur.
*/
import type { Tool } from '~/data/tools'
import type { DownloadAnalysisResponse, DownloadPlatform } from '~/shared/types/download'
import { getDownloadErrorMessage } from '~/shared/utils/download-error'
import { findDownloadFormat, getDefaultDownloadFormat } from '~/shared/utils/download-format'
import { assertValidUrlForPlatform, isDownloadPlatform } from '~/shared/utils/download-validation'
import type { Notification } from './useNotification'
import { useNotification } from './useNotification'

export type DownloadResult = DownloadAnalysisResponse['data']

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
    selectedQuality.value = ''

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
      const response = await $fetch<DownloadAnalysisResponse>('/api/download/analyze', {
        method: 'POST',
        body: {
          url: url.value,
          platform: tool.value.id as DownloadPlatform,
          quality: undefined,
        },
      })

      result.value = response.data
      selectedQuality.value = getDefaultDownloadFormat(response.data.formats)?.id || ''
      addNotification({ type: 'success', message: 'Média trouvé ! Choisissez la qualité.' })
    } catch (requestError) {
      error.value = getDownloadErrorMessage(requestError)
      addNotification({ type: 'error', message: error.value })
    } finally {
      isLoading.value = false
      removeNotificationFromComposable()
    }
  }

  const selectFormat = (formatId: string) => {
    selectedQuality.value = formatId

    if (!result.value) {
      return
    }

    const selectedFormat = findDownloadFormat(result.value.formats, formatId)

    if (selectedFormat) {
      result.value = {
        ...result.value,
        quality: selectedFormat.label,
      }
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
    selectFormat,
    fetchInfo,
    resetForm,
    validateUrl,
  }
}
