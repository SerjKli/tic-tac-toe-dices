import { test, expect } from '@playwright/test'
import { clearStorage } from '../helpers/game-helpers.js'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
  await page.goto('/setup')
})

test('default state shows 2 player cards', async ({ page }) => {
  const cards = page.locator('.px-card')
  await expect(cards).toHaveCount(2)
})

test('selecting player count 3 shows 3 player cards', async ({ page }) => {
  await page.locator('.count-buttons .action-btn').filter({ hasText: '3' }).click()
  await expect(page.locator('.px-card')).toHaveCount(3)
})

test('typing in player name input updates the value', async ({ page }) => {
  const nameInput = page.locator('.px-input').first()
  await nameInput.clear()
  await nameInput.fill('Tester')
  await expect(nameInput).toHaveValue('Tester')
})

test('Advanced mode toggle is selectable', async ({ page }) => {
  const advancedBtn = page.locator('.seg-btn').filter({ hasText: 'Advanced' })
  await advancedBtn.click()
  await expect(advancedBtn).toHaveClass(/active/)
})

test('Start Game button navigates to /game', async ({ page }) => {
  await page.locator('.action-btn.btn-success').filter({ hasText: 'Start Game' }).click()
  await expect(page).toHaveURL(/\/game$/)
})
