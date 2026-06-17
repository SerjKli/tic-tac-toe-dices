/**
 * Clear localStorage before page load to prevent the router guard
 * from redirecting "/" to "/game" when a saved game exists.
 * Call this before page.goto() or use in beforeEach.
 */
export async function clearStorage(page) {
  await page.addInitScript(() => localStorage.clear())
}

/**
 * Navigate to /setup and start a Classic mode local game with default 2 players.
 */
export async function startClassicGame(page) {
  await page.goto('/setup')
  await page.locator('.action-btn.btn-success').filter({ hasText: 'Start Game' }).click()
  await page.waitForURL('**/game')
}

/**
 * Navigate to /setup, enable Advanced mode, and start the game.
 */
export async function startAdvancedGame(page) {
  await page.goto('/setup')
  await page.locator('.seg-btn').filter({ hasText: 'Advanced' }).click()
  await page.locator('.action-btn.btn-success').filter({ hasText: 'Start Game' }).click()
  await page.waitForURL('**/game')
}

/**
 * Click the Roll Dice button and wait for candidate cells to appear.
 * The dice animation takes ~1.4 s, so this will wait up to 5 s.
 */
export async function rollAndPlace(page) {
  await page.locator('.roll-btn').click()
  await page.locator('.game-cell.is-candidate').first().waitFor({ state: 'visible', timeout: 5000 })
  await page.locator('.game-cell.is-candidate').first().click()
}

/**
 * Fast-forward a classic game to a win by calling Pinia store actions
 * directly in the browser context — bypasses the dice animation entirely.
 * Waits for the win banner (.win-overlay) to appear in the DOM afterwards.
 */
export async function playUntilWin(page) {
  await page.evaluate(async () => {
    const pinia = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia
    const game = pinia._s.get('game')

    for (let i = 0; i < 300; i++) {
      if (game.isOver) break

      if (game.isRolling) {
        game.rollDice()
      } else if (game.isChoosing) {
        const candidates = game.state.lastEvaluation?.candidates ?? []
        const playable = candidates.filter(c => c.action !== 'BLOCKED')
        const pick = playable[0] ?? candidates[0]
        if (pick) game.makeMove({ row: pick.row, col: pick.col })
        else if (game.canSkip) game.skipTurn()
      }

      await new Promise(r => setTimeout(r, 15))
    }
  })

  await page.locator('.win-overlay').waitFor({ state: 'visible', timeout: 5000 })
}

/**
 * Returns the current player name shown in the player strip.
 */
export async function getCurrentPlayerName(page) {
  return page.locator('.player-strip .player-name').first().innerText()
}
