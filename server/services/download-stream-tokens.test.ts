import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDownloadStreamToken,
  type DownloadStreamTokenPayload,
  getDownloadStreamToken,
} from './download-stream-tokens'

function buildPayload(
  expiresAt: string,
  url = 'https://example.test/video',
): DownloadStreamTokenPayload {
  return {
    expiresAt,
    filename: 'video.mp4',
    formatId: '22',
    options: {} as DownloadStreamTokenPayload['options'],
    url,
  }
}

describe('download stream tokens', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-19T16:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates and resolves a valid stream token', () => {
    const payload = buildPayload('2026-11-19T16:05:00.000Z')
    const token = createDownloadStreamToken(payload)

    expect(token).toBeTruthy()
    expect(getDownloadStreamToken(token)).toEqual(payload)
  })

  it('returns null for missing or unknown tokens', () => {
    expect(getDownloadStreamToken(undefined)).toBeNull()
    expect(getDownloadStreamToken('')).toBeNull()
    expect(getDownloadStreamToken('non-existent-token')).toBeNull()
  })

  it('expires and removes tokens once their expiration timestamp is reached', () => {
    const payload = buildPayload('2026-11-19T16:01:00.000Z')
    const token = createDownloadStreamToken(payload)

    vi.advanceTimersByTime(60_000)

    expect(getDownloadStreamToken(token)).toBeNull()
    expect(getDownloadStreamToken(token)).toBeNull()
  })

  it('cleans up expired tokens when issuing a new token while keeping active ones', () => {
    const expiredToken = createDownloadStreamToken(
      buildPayload('2026-11-19T16:00:30.000Z', 'https://a.test'),
    )
    const activePayload = buildPayload('2026-11-19T16:10:00.000Z', 'https://b.test')
    const activeToken = createDownloadStreamToken(activePayload)

    vi.advanceTimersByTime(45_000)

    const freshPayload = buildPayload('2026-11-19T16:15:00.000Z', 'https://c.test')
    const freshToken = createDownloadStreamToken(freshPayload)

    expect(getDownloadStreamToken(expiredToken)).toBeNull()
    expect(getDownloadStreamToken(activeToken)).toEqual(activePayload)
    expect(getDownloadStreamToken(freshToken)).toEqual(freshPayload)
  })
})
