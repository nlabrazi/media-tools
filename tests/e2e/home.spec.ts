import { expect, test } from '@playwright/test'

test.describe('Home Page and Platform Showcase', () => {
  test('displays hero section with stats, badge and call-to-actions', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Badge
    await expect(page.getByText('Nouveau : support TikTok sans watermark')).toBeVisible()

    // Main heading
    const heading = page.locator('main h1')
    await expect(heading).toContainText('Téléchargez vos')
    await expect(heading).toContainText('médias sociaux')
    await expect(heading).toContainText('en un clic')

    // Stats
    const stats = ['10M+', '4', '1080p', '100%']
    for (const val of stats) {
      await expect(page.getByText(val, { exact: true })).toBeVisible()
    }

    // CTA Anchor
    const ctaStart = page.getByRole('link', { name: /Commencer maintenant/i })
    await expect(ctaStart).toBeVisible()
    await expect(ctaStart).toHaveAttribute('href', '#tools')
  })

  test('displays all platform cards in ToolsGrid and navigates to each downloader', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const toolsSection = page.locator('section#tools')
    await expect(toolsSection).toBeVisible()
    await expect(toolsSection.locator('h2')).toContainText('Choisissez votre plateforme')

    const toolCards = [
      { name: 'Instagram', route: '/downloader/instagram', sampleTag: 'Reel' },
      { name: 'TikTok', route: '/downloader/tiktok', sampleTag: 'Video (sans watermark)' },
      { name: 'YouTube', route: '/downloader/youtube', sampleTag: 'MP4 1080p' },
      { name: 'Twitter / X', route: '/downloader/twitter', sampleTag: 'GIF' },
    ]

    for (const tool of toolCards) {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const card = page.locator('#tools').getByRole('link', { name: new RegExp(tool.name, 'i') })
      await expect(card).toBeVisible()
      await expect(card.getByText(tool.sampleTag, { exact: true })).toBeVisible()

      await card.click()
      await expect(page).toHaveURL(new RegExp(tool.route))
      await expect(page.locator('main h1')).toContainText(tool.name)
    }
  })

  test('renders all 6 feature cards in FeaturesSection', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(
      page.locator('section h2').filter({ hasText: 'Pourquoi MediaTools ?' }),
    ).toBeVisible()

    const expectedFeatures = [
      'Ultra Rapide',
      'Sécurisé',
      'Multi-plateforme',
      'Sans watermark',
      'Extraction audio',
      '100% Gratuit',
    ]

    for (const title of expectedFeatures) {
      await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible()
    }
  })
})
