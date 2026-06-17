# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced-game.spec.js >> drawing a card exits the card phase
- Location: e2e/tests/advanced-game.spec.js:13:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.seg-btn').filter({ hasText: 'Advanced' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - text: The server is configured with a public base URL of /ttt-6/ - did you mean to visit
  - link "/ttt-6/setup" [ref=e2] [cursor=pointer]:
    - /url: /ttt-6/setup
  - text: instead?
```

# Test source

```ts
  1  | /**
  2  |  * Clear localStorage before page load to prevent the router guard
  3  |  * from redirecting "/" to "/game" when a saved game exists.
  4  |  * Call this before page.goto() or use in beforeEach.
  5  |  */
  6  | export async function clearStorage(page) {
  7  |   await page.addInitScript(() => localStorage.clear())
  8  | }
  9  | 
  10 | /**
  11 |  * Navigate to /setup and start a Classic mode local game with default 2 players.
  12 |  */
  13 | export async function startClassicGame(page) {
  14 |   await page.goto('/setup')
  15 |   await page.locator('.action-btn.btn-success').filter({ hasText: 'Start Game' }).click()
  16 |   await page.waitForURL('**/game')
  17 | }
  18 | 
  19 | /**
  20 |  * Navigate to /setup, enable Advanced mode, and start the game.
  21 |  */
  22 | export async function startAdvancedGame(page) {
  23 |   await page.goto('/setup')
> 24 |   await page.locator('.seg-btn').filter({ hasText: 'Advanced' }).click()
     |                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  25 |   await page.locator('.action-btn.btn-success').filter({ hasText: 'Start Game' }).click()
  26 |   await page.waitForURL('**/game')
  27 | }
  28 | 
  29 | /**
  30 |  * Click the Roll Dice button and wait for candidate cells to appear.
  31 |  * The dice animation takes ~1.4 s, so this will wait up to 5 s.
  32 |  */
  33 | export async function rollAndPlace(page) {
  34 |   await page.locator('.roll-btn').click()
  35 |   await page.locator('.game-cell.is-candidate').first().waitFor({ state: 'visible', timeout: 5000 })
  36 |   await page.locator('.game-cell.is-candidate').first().click()
  37 | }
  38 | 
  39 | /**
  40 |  * Fast-forward a classic game to a win by calling Pinia store actions
  41 |  * directly in the browser context — bypasses the dice animation entirely.
  42 |  * Waits for the win banner (.win-overlay) to appear in the DOM afterwards.
  43 |  */
  44 | export async function playUntilWin(page) {
  45 |   await page.evaluate(async () => {
  46 |     const pinia = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia
  47 |     const game = pinia._s.get('game')
  48 | 
  49 |     for (let i = 0; i < 300; i++) {
  50 |       if (game.isOver) break
  51 | 
  52 |       if (game.isRolling) {
  53 |         game.rollDice()
  54 |       } else if (game.isChoosing) {
  55 |         const candidates = game.state.lastEvaluation?.candidates ?? []
  56 |         const playable = candidates.filter(c => c.action !== 'BLOCKED')
  57 |         const pick = playable[0] ?? candidates[0]
  58 |         if (pick) game.makeMove({ row: pick.row, col: pick.col })
  59 |         else if (game.canSkip) game.skipTurn()
  60 |       }
  61 | 
  62 |       await new Promise(r => setTimeout(r, 15))
  63 |     }
  64 |   })
  65 | 
  66 |   await page.locator('.win-overlay').waitFor({ state: 'visible', timeout: 5000 })
  67 | }
  68 | 
  69 | /**
  70 |  * Returns the current player name shown in the player strip.
  71 |  */
  72 | export async function getCurrentPlayerName(page) {
  73 |   return page.locator('.player-strip .player-name').first().innerText()
  74 | }
  75 | 
```