# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.js >> "Play Now" link navigates to setup page
- Location: e2e/tests/home.spec.js:15:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Play Now')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e7]:
      - button "RU" [ref=e8] [cursor=pointer]
      - button "EN" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - button "Pixel" [ref=e11] [cursor=pointer]:
        - generic [ref=e13]: Pixel
      - button "Classic" [ref=e14] [cursor=pointer]:
        - generic [ref=e16]: Classic
      - button "Dark-Neon" [ref=e17] [cursor=pointer]:
        - generic [ref=e19]: Dark-Neon
  - generic [ref=e20]:
    - generic [ref=e21]: 🎲
    - heading "TIC - TAC - DICE" [level=1] [ref=e22]:
      - generic [ref=e23]: TIC
      - generic [ref=e24]: "-"
      - generic [ref=e25]: TAC
      - generic [ref=e26]: "-"
      - generic [ref=e27]: DICE
  - paragraph [ref=e28]: Стратегическая игра 6×6, где кубики определяют поле боя.
  - list [ref=e29]:
    - listitem [ref=e30]: → 2–5 игроков, каждый с уникальным символом
    - listitem [ref=e31]: → Бросьте кубики → две клетки на выбор → вы выбираете
    - listitem [ref=e32]: → Занимайте пустые, захватывайте чужие, дубль = ещё ход
    - listitem [ref=e33]: → Первый, кто выстроит 3 в ряд, побеждает!
  - link "Играть" [ref=e34] [cursor=pointer]:
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
  11 |   await expect(page.getByText('A 6×6 strategy game')).toBeVisible()
  12 |   await expect(page.getByText('First to get 3 in a row wins!')).toBeVisible()
  13 | })
  14 | 
  15 | test('"Play Now" link navigates to setup page', async ({ page }) => {
  16 |   await page.goto('/')
> 17 |   await page.getByText('Play Now').click()
     |                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 |   await expect(page).toHaveURL(/\/setup$/)
  19 | })
  20 | 
```