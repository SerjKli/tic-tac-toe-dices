import { test, expect } from '@playwright/test'
import { clearStorage, startClassicGame, rollAndPlace, playUntilWin } from '../helpers/game-helpers.js'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
})

test('board renders 36 cells on game start', async ({ page }) => {
  await startClassicGame(page)
  await expect(page.locator('.game-cell')).toHaveCount(36)
})

test('roll dice button is visible at game start', async ({ page }) => {
  await startClassicGame(page)
  await expect(page.locator('.roll-btn')).toBeVisible()
})

test('candidate cells appear after rolling', async ({ page }) => {
  await startClassicGame(page)
  await page.locator('.roll-btn').click()
  await expect(page.locator('.game-cell.is-candidate').first()).toBeVisible({ timeout: 5000 })
})

test('clicking a candidate cell places a mark', async ({ page }) => {
  await startClassicGame(page)
  await rollAndPlace(page)
  await expect(page.locator('.cell-mark').first()).toBeVisible()
})

test('turn advances after placing a mark', async ({ page }) => {
  await startClassicGame(page)

  const initialState = await page.evaluate(() => {
    const game = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('game')
    return game.state.currentPlayer?.id
  })

  await rollAndPlace(page)

  const nextState = await page.evaluate(() => {
    const game = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('game')
    return game.state.currentPlayer?.id
  })

  expect(nextState).not.toBe(initialState)
})

test('win banner appears after a player wins', async ({ page }) => {
  await startClassicGame(page)
  await playUntilWin(page)
  await expect(page.locator('.win-overlay')).toBeVisible()
})

test('"Play Again" on win banner navigates back to setup', async ({ page }) => {
  await startClassicGame(page)
  await playUntilWin(page)
  await page.locator('.win-overlay .action-btn').filter({ hasText: 'Play Again' }).click()
  await expect(page).toHaveURL(/\/setup$/)
})
