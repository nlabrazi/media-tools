import { createError, readBody } from 'h3'
import {
  DownloadStartError,
  buildMockDownloadStartResponse,
  downloadStartErrorMessages,
} from '~/server/utils/download-start'
import type { DownloadStartRequest, DownloadStartResponse } from '~/shared/types/download'

export default defineEventHandler(async (event): Promise<DownloadStartResponse> => {
  const body = await readBody<Partial<DownloadStartRequest>>(event)

  try {
    return buildMockDownloadStartResponse(body)
  } catch (error) {
    if (error instanceof DownloadStartError) {
      throw createError({
        statusCode: 400,
        statusMessage: downloadStartErrorMessages[error.code],
      })
    }

    throw error
  }
})
