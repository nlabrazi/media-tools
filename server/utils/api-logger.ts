import { getRequestURL } from 'h3'
import type { H3Event } from 'h3'

type ApiLogLevel = 'error' | 'warn'

interface ApiErrorLogInput {
  error?: unknown
  event: H3Event
  level?: ApiLogLevel
  message: string
  statusCode: number
}

const appName = 'media-tools'

const stringifyError = (error: unknown): string | undefined => {
  if (error === undefined) {
    return undefined
  }

  return String(error)
}

export const logApiError = ({
  error,
  event,
  level = 'error',
  message,
  statusCode,
}: ApiErrorLogInput) => {
  const payload = {
    app: appName,
    level,
    route: getRequestURL(event).pathname,
    statusCode,
    message,
    error: stringifyError(error),
  }

  const line = JSON.stringify(payload)

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.error(line)
}
