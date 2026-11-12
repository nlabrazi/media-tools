import { expect, test } from '@playwright/test'

test.describe('Navigation and Shell', () => {
  test('navigates through desktop header links across all downloaders', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Logo brand
    const logo = page.locator('header').getByRole('link', { name: /MediaTools/i })
    await expect(logo).toBeVisible()

    const platforms = [
      { name: 'Instagram', route: '/downloader/instagram', heading: 'Instagram' },
      { name: 'TikTok', route: '/downloader/tiktok', heading: 'TikTok' },
      { name: 'YouTube', route: '/downloader/youtube', heading: 'YouTube' },
      { name: 'Twitter / X', route: '/downloader/twitter', heading: 'Twitter / X' },
    ]

    for (const platform of platforms) {
      const navLink = page
        .locator('header nav')
        .getByRole('link', { name: new RegExp(platform.name, 'i') })
      await expect(navLink).toBeVisible()
      await navLink.click()

      await expect(page).toHaveURL(new RegExp(platform.route))
      await expect(page.locator('main h1')).toContainText(platform.heading)

      // Verify breadcrumb back link
      const backLink = page.getByRole('link', { name: '← Retour aux outils' })
      await expect(backLink).toBeVisible()
    }

    // Click logo to return to home
    await logo.click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('h1')).toContainText('Téléchargez vos')
  })

  test('toggles mobile menu drawer and allows navigating to downloader pages', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Desktop nav is hidden on mobile
    const desktopNav = page.locator('header nav.hidden.md\\:flex')
    await expect(desktopNav).toBeHidden()

    // Toggle mobile menu open
    const burgerButton = page.locator('header button.md\\:hidden')
    await expect(burgerButton).toBeVisible()
    await expect(burgerButton).toContainText('☰')

    await burgerButton.click()
    await expect(burgerButton).toContainText('✕')

    // Drawer is visible
    const mobileDrawer = page.locator('header div.md\\:hidden nav')
    await expect(mobileDrawer).toBeVisible()

    // Click TikTok in mobile menu
    const tiktokLink = mobileDrawer.getByRole('link', { name: /TikTok/i })
    await expect(tiktokLink).toBeVisible()
    await tiktokLink.click()

    // Verify navigation and drawer closed
    await expect(page).toHaveURL(/\/downloader\/tiktok/)
    await expect(page.locator('main h1')).toContainText('TikTok')
    await expect(page.locator('header div.md\\:hidden')).toBeHidden()
  })

  test('navigates to About page and back to home', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Click About button in Hero
    const aboutBtn = page.getByRole('link', { name: 'En savoir plus' })
    await expect(aboutBtn).toBeVisible()
    await aboutBtn.click()

    await expect(page).toHaveURL(/\/about/)
    await expect(page.locator('main h1')).toContainText('À propos de MediaTools')
    await expect(page.getByText('version 1.0')).toBeVisible()

    // Footer copyright is visible
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('© 2026 MediaTools')
  })
})
