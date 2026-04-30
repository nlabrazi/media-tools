import { createError, readBody } from 'h3'
import { YouTubeDownloaderError, startYouTubeDownload } from '~/server/services/downloaders/youtube'
import {
  DownloadStartError,
  buildMockDownloadStartResponse,
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

    if (request.platform === 'youtube') {
      return await startYouTubeDownload(request, {
        executablePath: runtimeConfig.download?.ytDlpPath,
      })
    }

    return buildMockDownloadStartResponse(body)
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
