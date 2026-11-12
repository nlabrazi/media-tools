import { expect, test } from '@playwright/test'

test.describe('Downloader Engine and User Journeys', () => {
  test('validates URL client-side and displays explicit error messages', async ({ page }) => {
    await page.goto('/downloader/youtube')
    await page.waitForLoadState('networkidle')

    const input = page.getByPlaceholder(/youtube\.com\/watch/i)
    const analyzeBtn = page.getByRole('button', { name: 'Analyser le lien' })

    // 1. Submit empty URL
    await analyzeBtn.click()
    await expect(page.getByText('Veuillez entrer une URL.')).toBeVisible()

    // 2. Submit mismatched platform URL (TikTok link into YouTube downloader)
    await input.fill('https://www.tiktok.com/@creator/video/123456789')
    await analyzeBtn.click()
    await expect(page.getByText('URL YouTube invalide. Vérifiez le format.')).toBeVisible()

    // 3. Submit malformed URL
    await input.fill('ftp://invalid-stream.com/video')
    await analyzeBtn.click()
    await expect(page.getByText('URL YouTube invalide. Vérifiez le format.')).toBeVisible()
  })

  test('successfully analyzes YouTube media, switches format, and initiates download', async ({
    page,
  }) => {
    // Intercept analyze API
    let analyzePayload: Record<string, unknown> | null = null
    await page.route('**/api/download/analyze', async (route) => {
      analyzePayload = JSON.parse(route.request().postData() || '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
            platform: 'youtube',
            downloadUrl: '/api/download/stream?token=mock-token-1',
            filename: 'rick_astley_never_gonna_give_you_up.mp4',
            quality: 'MP4 1080p',
            formats: [
              { id: '1080p', label: 'MP4 1080p', type: 'video', extension: 'mp4' },
              { id: '720p', label: 'MP4 720p', type: 'video', extension: 'mp4' },
              { id: 'mp3', label: 'MP3 320kbps', type: 'audio', extension: 'mp3' },
            ],
            fileSize: '48.5 MB',
          },
        }),
      })
    })

    // Intercept start download API
    let startPayload: Record<string, unknown> | null = null
    await page.route('**/api/download/start', async (route) => {
      startPayload = JSON.parse(route.request().postData() || '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            downloadUrl: 'data:text/plain;charset=utf-8,dummy_video_stream',
            expiresAt: '2026-09-22T23:00:00.000Z',
            filename: 'rick_astley_never_gonna_give_you_up_720p.mp4',
            format: { id: '720p', label: 'MP4 720p', type: 'video', extension: 'mp4' },
          },
        }),
      })
    })

    await page.goto('/downloader/youtube')
    await page.waitForLoadState('networkidle')

    // Fill valid YouTube URL
    const input = page.getByPlaceholder(/youtube\.com\/watch/i)
    await input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    // Trigger analysis
    await page.getByRole('button', { name: 'Analyser le lien' }).click()

    // Verify analyze request payload
    await expect
      .poll(() => analyzePayload)
      .toMatchObject({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
      })

    // Toast notification for successful analysis
    await expect(page.getByText('Média trouvé ! Choisissez la qualité.')).toBeVisible()

    // Verify preview card details
    await expect(page.getByText('Média trouvé ✅')).toBeVisible()
    await expect(page.getByText('rick_astley_never_gonna_give_you_up.mp4')).toBeVisible()
    await expect(page.getByText('48.5 MB')).toBeVisible()

    // Quality selector formats
    const btn1080 = page.getByRole('button', { name: 'MP4 1080p' })
    const btn720 = page.getByRole('button', { name: 'MP4 720p' })
    const btnMp3 = page.getByRole('button', { name: 'MP3 320kbps' })

    await expect(btn1080).toBeVisible()
    await expect(btn720).toBeVisible()
    await expect(btnMp3).toBeVisible()

    // Switch format to 720p
    await btn720.click()
    await expect(btn720).toHaveClass(/border-cyber-blue/)

    // Click download button
    const downloadBtn = page.getByRole('button', { name: /Télécharger/i })
    await expect(downloadBtn).toBeVisible()
    await downloadBtn.click()

    // Verify start download payload
    await expect
      .poll(() => startPayload)
      .toMatchObject({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        formatId: '720p',
      })

    // Verify toast notification for ready download
    await expect(page.getByText('Téléchargement prêt.')).toBeVisible()
  })

  test('handles backend analysis failure gracefully with error toast', async ({ page }) => {
    // Intercept analyze API returning error
    await page.route('**/api/download/analyze', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 404,
          statusMessage: 'Vidéo introuvable ou privée sur la plateforme.',
        }),
      })
    })

    await page.goto('/downloader/youtube')
    await page.waitForLoadState('networkidle')

    const input = page.getByPlaceholder(/youtube\.com\/watch/i)
    await input.fill('https://www.youtube.com/watch?v=private_video_id')
    await page.getByRole('button', { name: 'Analyser le lien' }).click()

    // Verify error notification
    await expect(
      page
        .locator('.glass-card')
        .filter({ hasText: /Vidéo introuvable|erreur/i })
        .first(),
    ).toBeVisible()
  })

  test('supports TikTok video downloader nominal flow', async ({ page }) => {
    await page.route('**/api/download/analyze', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            url: 'https://www.tiktok.com/@tiktok/video/7123456789012345678',
            preview: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
            platform: 'tiktok',
            downloadUrl: '/api/download/stream?token=tiktok-token',
            filename: 'tiktok_viral_dance.mp4',
            quality: 'Video (sans watermark)',
            formats: [
              {
                id: 'hd-no-watermark',
                label: 'Video (sans watermark)',
                type: 'video',
                extension: 'mp4',
              },
              { id: 'watermark', label: 'Video (avec watermark)', type: 'video', extension: 'mp4' },
              { id: 'audio', label: 'Audio (MP3)', type: 'audio', extension: 'mp3' },
            ],
            fileSize: '12.8 MB',
          },
        }),
      })
    })

    await page.goto('/downloader/tiktok')
    await page.waitForLoadState('networkidle')

    await page
      .getByPlaceholder(/tiktok\.com/i)
      .fill('https://www.tiktok.com/@tiktok/video/7123456789012345678')
    await page.getByRole('button', { name: 'Analyser le lien' }).click()

    await expect(page.getByText('Média trouvé ✅')).toBeVisible()
    await expect(page.getByText('tiktok_viral_dance.mp4')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Video (sans watermark)' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Audio (MP3)' })).toBeVisible()
  })
})
