import { describe, expect, it } from 'vitest'
import {
  DownloadValidationError,
  assertValidUrlForPlatform,
  isDownloadPlatform,
  normalizeHostname,
} from './download-validation'

describe('download validation', () => {
  it('recognizes supported platforms', () => {
    expect(isDownloadPlatform('instagram')).toBe(true)
    expect(isDownloadPlatform('tiktok')).toBe(true)
    expect(isDownloadPlatform('youtube')).toBe(true)
    expect(isDownloadPlatform('twitter')).toBe(true)
    expect(isDownloadPlatform('facebook')).toBe(false)
    expect(isDownloadPlatform(null)).toBe(false)
  })

  it('normalizes www hostnames', () => {
    expect(normalizeHostname('www.youtube.com')).toBe('youtube.com')
    expect(normalizeHostname('youtu.be')).toBe('youtu.be')
  })

  it('accepts URLs matching their platform', () => {
    expect(() =>
      assertValidUrlForPlatform('https://www.instagram.com/p/demo', 'instagram'),
    ).not.toThrow()
    expect(() => assertValidUrlForPlatform('https://vm.tiktok.com/demo', 'tiktok')).not.toThrow()
    expect(() => assertValidUrlForPlatform('https://youtu.be/demo', 'youtube')).not.toThrow()
    expect(() => assertValidUrlForPlatform('https://x.com/user/status/1', 'twitter')).not.toThrow()
  })

  it('rejects malformed URLs', () => {
    expect(() => assertValidUrlForPlatform('not-a-url', 'youtube')).toThrow(
      new DownloadValidationError('INVALID_URL'),
    )
  })

  it('rejects unsupported protocols', () => {
    expect(() => assertValidUrlForPlatform('ftp://youtube.com/video', 'youtube')).toThrow(
      new DownloadValidationError('UNSUPPORTED_PROTOCOL'),
    )
  })

  it('rejects URLs from another platform', () => {
    expect(() =>
      assertValidUrlForPlatform('https://youtube.com/watch?v=demo', 'instagram'),
    ).toThrow(new DownloadValidationError('PLATFORM_HOST_MISMATCH'))
  })
})
