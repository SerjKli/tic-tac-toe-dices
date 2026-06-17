# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.js >> home page renders the tagline and rules
- Location: e2e/tests/home.spec.js:8:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('A 6×6 strategy game')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('A 6×6 strategy game')

```

```yaml
- button "RU"
- button "EN"
- button "Pixel"
- button "Classic"
- button "Dark-Neon"
- text: 🎲
- heading "TIC - TAC - DICE" [level=1]
- paragraph: Стратегическая игра 6×6, где кубики определяют поле боя.
- list:
  - listitem: → 2–5 игроков, каждый с уникальным символом
  - listitem: → Бросьте кубики → две клетки на выбор → вы выбираете
  - listitem: → Занимайте пустые, захватывайте чужие, дубль = ещё ход
  - listitem: → Первый, кто выстроит 3 в ряд, побеждает!
- link "Играть":
  - /url: /ttt-6/setup
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { clearStorage } from '../helpers/game-helpers.js'
  3  | 
  4  | test.beforeEach(async ({ page }) => {
  5  |   await clearStorage(page)
  6  | })
  7  | 
  8  | test('home page renders the tagline and rules', async ({ page }) => {
  9  |   await page.goto('/')
  10 |   await expect(page.locator('.hero')).toBeVisible()
> 11 |   await expect(page.getByText('A 6×6 strategy game')).toBeVisible()
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  12 |   await expect(page.getByText('First to get 3 in a row wins!')).toBeVisible()
  13 | })
  14 | 
  15 | test('"Play Now" link navigates to setup page', async ({ page }) => {
  16 |   await page.goto('/')
  17 |   await page.getByText('Play Now').click()
  18 |   await expect(page).toHaveURL(/\/setup$/)
  19 | })
  20 | 
```