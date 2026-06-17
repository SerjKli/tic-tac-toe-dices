# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup.spec.js >> Advanced mode toggle is selectable
- Location: e2e/tests/setup.spec.js:26:1

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
  1  | import { test, expect } from '@playwright/test'
  2  | import { clearStorage } from '../helpers/game-helpers.js'
  3  | 
  4  | test.beforeEach(async ({ page }) => {
  5  |   await clearStorage(page)
  6  |   await page.goto('/setup')
  7  | })
  8  | 
  9  | test('default state shows 2 player cards', async ({ page }) => {
  10 |   const cards = page.locator('.px-card')
  11 |   await expect(cards).toHaveCount(2)
  12 | })
  13 | 
  14 | test('selecting player count 3 shows 3 player cards', async ({ page }) => {
  15 |   await page.locator('.count-buttons .action-btn').filter({ hasText: '3' }).click()
  16 |   await expect(page.locator('.px-card')).toHaveCount(3)
  17 | })
  18 | 
  19 | test('typing in player name input updates the value', async ({ page }) => {
  20 |   const nameInput = page.locator('.px-input').first()
  21 |   await nameInput.clear()
  22 |   await nameInput.fill('Tester')
  23 |   await expect(nameInput).toHaveValue('Tester')
  24 | })
  25 | 
  26 | test('Advanced mode toggle is selectable', async ({ page }) => {
  27 |   const advancedBtn = page.locator('.seg-btn').filter({ hasText: 'Advanced' })
> 28 |   await advancedBtn.click()
     |                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  29 |   await expect(advancedBtn).toHaveClass(/active/)
  30 | })
  31 | 
  32 | test('Start Game button navigates to /game', async ({ page }) => {
  33 |   await page.locator('.action-btn.btn-success').filter({ hasText: 'Start Game' }).click()
  34 |   await expect(page).toHaveURL(/\/game$/)
  35 | })
  36 | 
```