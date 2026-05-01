import { randomUUID } from 'node:crypto'
import type { YtDlpDownloaderOptions } from './downloaders/yt-dlp'

export interface DownloadStreamTokenPayload {
  expiresAt: string
  filename: string
  formatId: string
  options: YtDlpDownloaderOptions
  url: string
}

const downloadStreamTokens = new Map<string, DownloadStreamTokenPayload>()

const deleteExpiredDownloadStreamTokens = () => {
  const now = Date.now()

  for (const [token, payload] of downloadStreamTokens.entries()) {
    if (Date.parse(payload.expiresAt) <= now) {
      downloadStreamTokens.delete(token)
    }
  }
}

export const createDownloadStreamToken = (payload: DownloadStreamTokenPayload): string => {
  deleteExpiredDownloadStreamTokens()

  const token = randomUUID()
  downloadStreamTokens.set(token, payload)

  return token
}

export const getDownloadStreamToken = (
  token: string | undefined,
): DownloadStreamTokenPayload | null => {
  if (!token) {
    return null
  }

  const payload = downloadStreamTokens.get(token)

  if (!payload) {
    return null
  }

  if (Date.parse(payload.expiresAt) <= Date.now()) {
    downloadStreamTokens.delete(token)
    return null
  }

  return payload
}
