import { createError, readBody } from 'h3'
import { getDownloaderService } from '~/server/services/downloaders'
import { YouTubeDownloaderError } from '~/server/services/downloaders/youtube'
import {
  DownloadStartError,
  downloadStartErrorMessages,
  parseDownloadStartBaseRequest,
} from '~/server/utils/download-start'
import type { DownloadStartRequest, DownloadStartResponse } from '~/shared/types/download'
import { useRuntimeConfig } from '#imports'

type DownloadRuntimeConfig = {
  download?: {
    ytDlpPath?: string
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
