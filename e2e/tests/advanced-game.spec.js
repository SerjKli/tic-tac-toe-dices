import { test, expect } from '@playwright/test'
import { clearStorage, startAdvancedGame } from '../helpers/game-helpers.js'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
})

test('card phase panel appears at advanced game start', async ({ page }) => {
  await startAdvancedGame(page)
  await expect(page.locator('.card-phase-panel')).toBeVisible()
})

test('drawing a card exits the card phase', async ({ page }) => {
  await startAdvancedGame(page)
  await page.locator('.draw-btn').click()
  await expect(page.locator('.card-phase-panel')).not.toBeVisible({ timeout: 3000 })
})

test('roll button is available after exiting card phase', async ({ page }) => {
  await startAdvancedGame(page)
  await page.locator('.draw-btn').click()
  await expect(page.locator('.roll-btn')).toBeVisible({ timeout: 3000 })
})
