import { createError, readBody } from 'h3'
import type { DownloadStartRequest, DownloadStartResponse } from '~/shared/types/download'
import { useRuntimeConfig } from '#imports'
import { getDownloaderService } from '../../services/downloaders'
import { YouTubeDownloaderError } from '../../services/downloaders/youtube'
import {
  DownloadStartError,
  downloadStartErrorMessages,
  parseDownloadStartBaseRequest,
} from '../../utils/download-start'

type DownloadRuntimeConfig = {
  download?: {
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

    if (error instanceof YouTubeDownloaderError) {
      throw createError({
        statusCode: error.code === 'FORMAT_NOT_FOUND' ? 400 : 503,
        statusMessage:
          error.code === 'FORMAT_NOT_FOUND'
            ? 'Format non supporté pour ce média.'
            : 'Le service de téléchargement YouTube est temporairement indisponible.',
      })
    }

    throw error
  }
})
