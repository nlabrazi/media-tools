import { describe, expect, it } from 'vitest'
import type { DownloadFormat } from '~/shared/types/download'
import { findDownloadFormat, getDefaultDownloadFormat } from './download-format'

const formats: DownloadFormat[] = [
  { id: 'youtube-1080p', label: '1080p', type: 'video' },
  { id: 'youtube-mp3-320', label: 'MP3 320kbps', type: 'audio' },
]

describe('download format helpers', () => {
  it('finds a format by id', () => {
    expect(findDownloadFormat(formats, 'youtube-1080p')).toEqual(formats[0])
  })

  it('finds a format by label for backward compatibility', () => {
    expect(findDownloadFormat(formats, 'MP3 320kbps')).toEqual(formats[1])
  })

  it('returns null when no format matches', () => {
    expect(findDownloadFormat(formats, 'unknown')).toBeNull()
    expect(findDownloadFormat(formats, null)).toBeNull()
  })

  it('returns the first format as default', () => {
    expect(getDefaultDownloadFormat(formats)).toEqual(formats[0])
    expect(getDefaultDownloadFormat([])).toBeNull()
  })
})
