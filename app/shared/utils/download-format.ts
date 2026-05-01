import type { DownloadFormat } from '~/shared/types/download'

export const findDownloadFormat = (
  formats: DownloadFormat[],
  value: string | null | undefined,
): DownloadFormat | null => {
  if (!value) {
    return null
  }

  return formats.find((format) => format.id === value || format.label === value) || null
}

export const getDefaultDownloadFormat = (formats: DownloadFormat[]): DownloadFormat | null => {
  return formats[0] || null
}
