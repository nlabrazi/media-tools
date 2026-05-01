import { createError, readBody } from 'h3'
import type { DownloadStartRequest, DownloadStartResponse } from '~/shared/types/download'
import { useRuntimeConfig } from '#imports'
import { getDownloaderService } from '../../services/downloaders'
import { UnsupportedDownloaderError } from '../../services/downloaders/unsupported'
import { YtDlpDownloaderError } from '../../services/downloaders/yt-dlp'
import {
  DownloadStartError,
  downloadStartErrorMessages,
  parseDownloadStartBaseRequest,
} from '../../utils/download-start'

type DownloadRuntimeConfig = {
  download?: {
    ytDlpCookiesPath?: string
    ytDlpJsRuntime?: string
    ytDlpPath?: string
    ytDlpTimeoutMs?: number
  }
}

export default defineEventHandler(async (event): Promise<DownloadStartResponse> => {
  const runtimeConfig = useRuntimeConfig(event) as DownloadRuntimeConfig
  const body = await readBody<Partial<DownloadStartRequest>>(event)

  try {
    const request = parseDownloadStartBaseRequest(body)
    const downloaderService = getDownloaderService(request.platform)

    return await downloaderService.start(request, {
      ytDlpCookiesPath: runtimeConfig.download?.ytDlpCookiesPath,
      ytDlpJsRuntime: runtimeConfig.download?.ytDlpJsRuntime,
      ytDlpPath: runtimeConfig.download?.ytDlpPath,
      ytDlpTimeoutMs: runtimeConfig.download?.ytDlpTimeoutMs,
    })
  } catch (error) {
    if (error instanceof DownloadStartError) {
      throw createError({
        statusCode: 400,
        statusMessage: downloadStartErrorMessages[error.code],
      })
    }

    if (error instanceof YtDlpDownloaderError) {
      throw createError({
        statusCode: error.code === 'FORMAT_NOT_FOUND' ? 400 : 503,
        message:
          error.code === 'AUTH_REQUIRED'
            ? 'YouTube demande une authentification anti-bot. Configurez un fichier cookies yt-dlp côté serveur.'
            : undefined,
        statusMessage:
          error.code === 'AUTH_REQUIRED'
            ? 'Authentification YouTube requise.'
            : error.code === 'FORMAT_NOT_FOUND'
              ? 'Format non supporté pour ce média.'
              : 'Le service de téléchargement est temporairement indisponible.',
      })
    }

    if (error instanceof UnsupportedDownloaderError) {
      throw createError({
        message: `Le téléchargement ${error.platform} n'est pas encore disponible.`,
        statusCode: 501,
        statusMessage: 'Platform not implemented',
      })
    }

    throw error
  }
})
