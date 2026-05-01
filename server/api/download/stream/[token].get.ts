import { createError, getRouterParam, sendStream, setResponseHeader } from 'h3'
import { getDownloadStreamToken } from '../../../services/download-stream-tokens'
import { streamYtDlpFormat } from '../../../services/downloaders/yt-dlp'

export default defineEventHandler((event) => {
  const payload = getDownloadStreamToken(getRouterParam(event, 'token'))

  if (!payload) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Download link expired',
    })
  }

  const stream = streamYtDlpFormat(payload.url, payload.formatId, payload.options)

  setResponseHeader(event, 'Content-Type', 'application/octet-stream')
  setResponseHeader(
    event,
    'Content-Disposition',
    `attachment; filename="${payload.filename.replaceAll('"', '')}"`,
  )

  return sendStream(event, stream)
})
