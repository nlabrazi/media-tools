import { createError, getRouterParam, sendStream, setResponseHeader } from 'h3'
import { getDownloadStreamToken } from '../../../services/download-stream-tokens'
import {
  YtDlpDownloaderError,
  prepareYtDlpFormatDownload,
} from '../../../services/downloaders/yt-dlp'

export default defineEventHandler(async (event) => {
  const payload = getDownloadStreamToken(getRouterParam(event, 'token'))

  if (!payload) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Download link expired',
    })
  }

  try {
    const download = await prepareYtDlpFormatDownload(
      payload.url,
      payload.formatId,
      payload.options,
    )

    const cleanup = async () => {
      await download.cleanup()
    }

    event.node.res.once('finish', cleanup)
    event.node.res.once('close', cleanup)

    setResponseHeader(event, 'Content-Type', 'application/octet-stream')
    setResponseHeader(event, 'Content-Length', download.size)
    setResponseHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${payload.filename.replaceAll('"', '')}"`,
    )

    return sendStream(event, download.stream)
  } catch (error) {
    if (error instanceof YtDlpDownloaderError) {
      throw createError({
        statusCode: error.code === 'SERVICE_TIMEOUT' ? 504 : 503,
        statusMessage:
          error.code === 'SERVICE_TIMEOUT'
            ? 'Download service timed out'
            : 'Download service unavailable',
      })
    }

    throw error
  }
})
