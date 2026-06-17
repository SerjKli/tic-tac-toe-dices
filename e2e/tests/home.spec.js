import { test, expect } from '@playwright/test'
import { clearStorage } from '../helpers/game-helpers.js'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
})

test('home page renders the tagline and rules', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero')).toBeVisible()
  await expect(page.getByText('A 6×6 strategy game')).toBeVisible()
  await expect(page.getByText('First to get 3 in a row wins!')).toBeVisible()
})

test('"Play Now" link navigates to setup page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Play Now').click()
  await expect(page).toHaveURL(/\/setup$/)
})
