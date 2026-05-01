import { describe, expect, it } from 'vitest'
import { getDownloadErrorMessage } from './download-error'

describe('download error message', () => {
  it('uses the server status message from an ofetch error payload', () => {
    expect(
      getDownloadErrorMessage({
        data: {
          statusMessage: 'URL obligatoire.',
        },
      }),
    ).toBe('URL obligatoire.')
  })

  it('uses the server message when statusMessage is missing', () => {
    expect(
      getDownloadErrorMessage({
        data: {
          message: 'Plateforme non supportée.',
        },
      }),
    ).toBe('Plateforme non supportée.')
  })

  it('prefers the response body message over the HTTP status reason phrase', () => {
    expect(
      getDownloadErrorMessage({
        data: {
          message: "Le téléchargement instagram n'est pas encore disponible.",
          statusMessage: 'Platform not implemented',
        },
      }),
    ).toBe("Le téléchargement instagram n'est pas encore disponible.")
  })

  it('uses a top-level status message when no data payload exists', () => {
    expect(
      getDownloadErrorMessage({
        statusMessage: 'Cette URL ne correspond pas à la plateforme demandée.',
      }),
    ).toBe('Cette URL ne correspond pas à la plateforme demandée.')
  })

  it('maps rate limit errors even without a server message', () => {
    expect(
      getDownloadErrorMessage({
        statusCode: 429,
      }),
    ).toBe('Trop de tentatives. Réessayez dans quelques instants.')
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(getDownloadErrorMessage(new Error('Internal stack detail'))).toBe(
      "Impossible d'analyser ce média pour le moment.",
    )
    expect(getDownloadErrorMessage(null)).toBe("Impossible d'analyser ce média pour le moment.")
  })

  it('accepts a contextual fallback message', () => {
    expect(
      getDownloadErrorMessage(new Error('Internal stack detail'), 'Téléchargement impossible.'),
    ).toBe('Téléchargement impossible.')
  })
})
