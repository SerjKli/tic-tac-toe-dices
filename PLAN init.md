# Plan: Tic Tac Toe Six

## Context

Greenfield Vue 3 browser game. The architecture must be extensible from day one: online multiplayer, custom marks, board themes, and new rule variants are all anticipated future additions. The core game logic must be framework-agnostic so it can be reused on a server (for online play) without rewriting it.

---

## Confirmed Mechanics

- **6×6 board**, win = **3 in a row** (horizontal, vertical, or diagonal)
- **2–5 players**, each with a unique mark and color
- **Dice → two candidate cells**: roll (d1, d2) → options `(d1, d2)` AND `(d2, d1)`
  - Player **chooses** which cell to act on
  - Both options are the same on **doubles** → extra turn granted
- **Cell actions** (based on chosen cell's content):
  - Empty → **place** own mark
  - Own mark → **blocked** (must pick the other option)
  - Opponent's mark → **remove** it (cell becomes empty, player does NOT place)
- **Skip turn** if both candidate cells are blocked by own marks
- **Extra turn** on doubles (roll again, same player, after the move)

---

## Architecture

```
src/
├── core/                        # Pure JS — zero Vue/Pinia dependencies
│   ├── constants.js             # BOARD_SIZE=6, WIN_LENGTH=3, MAX_PLAYERS=5
│   ├── models/
│   │   ├── Player.js            # { id, name, mark, color }
│   │   ├── Cell.js              # { row, col, ownerId: string|null }
│   │   └── Board.js             # Grid creation, cell access, clone
│   ├── Dice.js                  # rollDice() → [d1,d2], getCandidates(d1,d2)
│   ├── MoveEvaluator.js         # evaluate(roll, board, playerId) → MoveResult
│   ├── WinDetector.js           # checkWin(board, playerId) → {winner,cells}|null
│   └── GameEngine.js            # State machine; emits events via EventTarget
│
├── services/
│   ├── IGameService.js          # JSDoc interface: startGame, rollDice, makeMove
│   └── LocalGameService.js      # Wraps GameEngine; implements IGameService
│   # Future: OnlineGameService.js (same interface, WebSocket transport)
│
├── stores/
│   ├── gameStore.js             # Reactive mirror of LocalGameService state
│   └── settingsStore.js         # playerCount, players[], theme (extensible)
│
├── components/
│   ├── game/
│   │   ├── GameBoard.vue        # 6×6 grid, highlights candidate cells
│   │   ├── GameCell.vue         # Single cell: mark, owner color, click handler
│   │   ├── DiceRoller.vue       # Shows dice faces + Roll button
│   │   ├── PlayerInfo.vue       # Current player's mark, name, "your turn"
│   │   ├── ScoreBoard.vue       # All players, pieces on board, turn order
│   │   └── WinBanner.vue        # Winner overlay + Play Again button
│   ├── setup/
│   │   ├── PlayerCountPicker.vue
│   │   ├── PlayerCard.vue       # Per-player: name input + mark/color picker
│   │   └── GameSetup.vue        # Wraps setup steps
│   └── shared/
│       └── BaseModal.vue
│
├── views/
│   ├── HomeView.vue
│   ├── SetupView.vue
│   └── GameView.vue
│
└── router/index.js
```

---

## Key Design Decisions

### GameEngine (core/GameEngine.js)
Pure class extending `EventTarget`. No framework coupling — can run in a Node.js server for online play.

**States:** `IDLE → ROLLING → CHOOSING → ROLLING | GAME_OVER`

- `ROLLING`: waiting for player to call `rollDice()`
- `CHOOSING`: dice rolled, `MoveEvaluator` computed options, waiting for `makeMove(cell)` or auto-skip
- After a valid move: check win → if doubles → back to `ROLLING` (same player) → else `ROLLING` (next player)

**Events emitted:** `dice-rolled`, `move-made`, `piece-captured`, `turn-skipped`, `extra-turn`, `game-won`

### MoveEvaluator (core/MoveEvaluator.js)
```js
// Returns:
{
  candidates: [
    { row, col, action: 'PLACE' | 'CAPTURE' | 'BLOCKED' }
  ],
  isDoubles: boolean,
  mustSkip: boolean   // true when all candidates are BLOCKED
}
```
Doubles collapse to one candidate (same row+col both ways). `mustSkip` drives auto-skip in the engine.

### WinDetector (core/WinDetector.js)
Only checks after a `PLACE` action (captures can't create a win). Scans all rows, columns, and diagonals for 3 consecutive cells with the same `ownerId`.

### Service Interface (services/IGameService.js)
```js
// Methods: startGame(config), rollDice(), makeMove({row,col}), resetGame()
// Properties: state (reactive/observable)
```
`LocalGameService` wraps `GameEngine`. A future `OnlineGameService` uses the same interface over WebSockets — the stores never change.

### Extension Points
| Future Feature | Where to add |
|---|---|
| Board themes | `settingsStore.theme` + CSS custom properties on `GameBoard` |
| Custom marks per player | Already in `Player` model; `PlayerCard.vue` gets a picker |
| Online multiplayer | New `OnlineGameService` implementing `IGameService` |
| New rules (e.g. power-ups) | New evaluator injected into `GameEngine` config |
| Tournaments | New store + views; core is untouched |

### Default Marks (2–5 players)
`✕` `○` `❤️` `⭐` `♦` — configurable in setup, stored in `settingsStore`

---

## Implementation Order

1. **Scaffold** — `npm create vue@latest` (Vue 3, Pinia, Vue Router, Vitest, ESLint)
2. **Core models** — `constants.js`, `Player`, `Cell`, `Board` + unit tests
3. **Dice + MoveEvaluator** — roll logic, candidate generation, action classification + tests
4. **WinDetector** — 3-in-a-row across all directions + tests
5. **GameEngine** — state machine wiring models + emitting events
6. **LocalGameService** — wraps engine, exposes clean API to stores
7. **Stores** — `settingsStore` (player config), `gameStore` (reactive game state)
8. **GameCell + GameBoard** — basic rendering, cell click, candidate highlights
9. **DiceRoller** — dice faces (SVG or CSS), roll button, disabled when not player's turn
10. **PlayerInfo + ScoreBoard** — current turn indicator, player list
11. **Setup flow** — `PlayerCountPicker` → `PlayerCard` list → `SetupView`
12. **GameView** — assembles all game components
13. **WinBanner** — overlay on `game-won` event, play again resets stores
14. **HomeView + routing** — home → setup → game navigation
15. **Polish** — CSS transitions for cell placement/capture, responsive layout

---

## Verification

- **Unit tests** (Vitest): `MoveEvaluator`, `WinDetector`, `GameEngine` state transitions
- **Manual play**: launch `npm run dev`, complete a 2-player game to a win, verify:
  - Dice roll generates correct candidate highlights on board
  - Doubles grant extra turn
  - Capture removes opponent piece (cell empty, no own piece placed)
  - Skip fires when both candidates blocked
  - Win banner appears on 3-in-a-row, Play Again resets correctly
