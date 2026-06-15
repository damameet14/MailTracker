import { expect, test } from '@playwright/test'

test('renders the dashboard shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
