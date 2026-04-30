const fallbackDownloadErrorMessage = "Impossible d'analyser ce média pour le moment."

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getStringProperty = (value: unknown, property: string): string | null => {
  if (!isRecord(value)) {
    return null
  }

  const propertyValue = value[property]
  return typeof propertyValue === 'string' && propertyValue.trim() ? propertyValue : null
}

export const getDownloadErrorMessage = (error: unknown): string => {
  if (!isRecord(error)) {
    return fallbackDownloadErrorMessage
  }

  const dataMessage =
    getStringProperty(error.data, 'statusMessage') ||
    getStringProperty(error.data, 'message') ||
    getStringProperty(error, 'statusMessage')

  if (dataMessage) {
    return dataMessage
  }

  const statusCode = typeof error.statusCode === 'number' ? error.statusCode : null

  if (statusCode === 429) {
    return 'Trop de tentatives. Réessayez dans quelques instants.'
  }

  return fallbackDownloadErrorMessage
}
