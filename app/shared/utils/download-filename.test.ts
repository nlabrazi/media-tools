import { describe, expect, it, vi } from 'vitest'
import { buildDownloadFilename } from './download-filename'

describe('download filename', () => {
  it('builds a deterministic filename from platform and format type', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-30T12:00:00.000Z'))

    expect(
      buildDownloadFilename('youtube', {
        id: 'youtube-mp3-320',
        label: 'MP3 320kbps',
        type: 'audio',
      }),
    ).toBe('youtube_youtube-mp3-320_1777550400000.mp3')

    vi.useRealTimers()
  })
})
