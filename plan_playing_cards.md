# Plan: Card System ("Advanced Mode")

## Context

Add an optional card-based mechanic to the game. Players choose **Classic** (current rules) or **Advanced** (+ cards) at setup. In Advanced mode a shuffled deck is created at game start; each turn, before rolling dice, the current player draws a card, plays a card, or skips that interaction (one action per turn). Cards can expand available cells, apply effects to players/cells, or replace the normal dice move entirely. Both local and Firebase online modes must support cards.

Confirmed design decisions (from user):
- Card interaction happens **before** rolling dice
- Expanding cards (Row/Col/3×3): player places **only** in the expanded area (standard candidates dropped)
- Explosion 4 & Random Clear 3: **replace** the normal move entirely (no mark placement)
- Firebase online mode must also support cards

---

## Architecture Overview

### Turn flow — Advanced mode

```
CARD_PHASE
  ├─ draw card          → ROLLING (normal)
  ├─ skip               → ROLLING (normal)
  ├─ use SIDE_EFFECT    → ROLLING (normal)    [Shield, Skip Turn, Cleanse, Extra Turn]
  ├─ use IMMEDIATE      → next player CARD_PHASE  [Random Clear 3, Shake]
  └─ use DEFERRED       → ROLLING w/ activeCard set  [Row Mark, Col Mark, 3×3, Explosion 4]

ROLLING
  └─ rollDice()         → CHOOSING (candidates modified if activeCard set)

CHOOSING
  ├─ no activeCard      → normal PLACE/CAPTURE/BLOCKED candidates
  ├─ ROW/COL/AREA card  → expanded candidates only (rows / cols / 3×3 area)
  └─ EXPLOSION4 card    → 2×2 anchor candidates (new CellAction.EXPLODE)

makeMove({ row, col })
  ├─ no activeCard      → place/capture → win check → next turn
  ├─ ROW/COL/AREA       → place in expanded cell → win check → next turn
  └─ EXPLOSION4         → clear 2×2 area (respecting shields) → next turn (no mark placed)
```

Turn-start check (before CARD_PHASE):
- If `player.skipTurnCount > 0` → decrement, emit `turn-skipped`, advance to next player
Turn-end check (after successful move):
- If `player.extraTurnCount > 0` → decrement, same player starts new CARD_PHASE

---

## Phase 1 — Core Data Structures

### `src/core/constants.js` — additions
```js
export const GameMode = Object.freeze({ CLASSIC: 'CLASSIC', ADVANCED: 'ADVANCED' })

// Extend GameState:
GameState.CARD_PHASE = 'CARD_PHASE'

export const CardType = Object.freeze({
  DEFENSIVE: 'DEFENSIVE',
  OFFENSIVE: 'OFFENSIVE',
  EXPANDING: 'EXPANDING',
})

export const CellAction  // add:
  EXPLODE: 'EXPLODE'   // Explosion 4 anchor cell

export const DECK_SIZE = 28       // total cards in starting deck
export const MAX_HAND_SIZE = 5    // max cards per player
```

### `src/core/cards.js` (new)
Frozen map of all card definitions. Each entry:
```js
{
  id: 'ROW_MARK',
  nameKey: 'cards.rowMark.name',
  descKey: 'cards.rowMark.desc',
  color: '#4CAF50',
  type: CardType.EXPANDING,
  weight: 0.7,
  behavior: 'DEFERRED',      // internal: SIDE_EFFECT | IMMEDIATE | DEFERRED
}
```

All 10 cards: `ROW_MARK`, `COL_MARK`, `AREA_3X3`, `SHIELD`, `EXPLOSION4`, `SKIP_TURN`, `CLEANSE`, `EXTRA_TURN`, `RANDOM_CLEAR3`, `SHAKE`

Behavior classification:
| Card | Behavior | Needs dice? | Replaces move? |
|------|----------|-------------|----------------|
| ROW_MARK, COL_MARK, AREA_3X3 | DEFERRED | yes | yes (expanded only) |
| EXPLOSION4 | DEFERRED | yes | yes (clear 2×2) |
| RANDOM_CLEAR3, SHAKE | IMMEDIATE | no | yes (turn ends) |
| SHIELD | SIDE_EFFECT | no | no |
| SKIP_TURN | SIDE_EFFECT | no | no |
| CLEANSE | SIDE_EFFECT | no | no |
| EXTRA_TURN | SIDE_EFFECT | no | no |

### `src/core/cards_deck.js` (new)
```js
export const DECK_CONFIG = [
  { cardId: 'ROW_MARK', count: 4 },
  { cardId: 'COL_MARK', count: 4 },
  { cardId: 'AREA_3X3', count: 3 },
  { cardId: 'SHIELD', count: 3 },
  { cardId: 'EXPLOSION4', count: 2 },
  { cardId: 'SKIP_TURN', count: 3 },
  { cardId: 'CLEANSE', count: 3 },
  { cardId: 'EXTRA_TURN', count: 2 },
  { cardId: 'RANDOM_CLEAR3', count: 2 },
  { cardId: 'SHAKE', count: 2 },
  // total = 28 = DECK_SIZE
]
```
`buildDeck()` helper: expand config → array of `{ instanceId, cardId }` → Fisher-Yates shuffle → return array.

### `src/core/models/Player.js` — additions
```js
hand: []               // Card[] — private to this player
skipTurnCount: 0       // number of turns to skip
extraTurnCount: 0      // queued extra turns
```

### `src/core/models/Cell.js` — addition
```js
shieldCount: 0         // stacked shields on this cell
```
Shield interaction: when a CAPTURE / EXPLODE action would remove a shielded cell (`shieldCount > 0`), decrement `shieldCount` instead and block the removal. Emit `shield-blocked` event.

---

## Phase 2 — Card Engine

### `src/core/CardEngine.js` (new)
Pure logic class (no Vue reactivity). Methods:

```js
buildDeck()                        // → shuffled Card[] from DECK_CONFIG
drawCard(deck, player)             // mutate: deck.shift() → player.hand.push()
hasReasonNotSelectCard(card, player, board, players)  // → bool (e.g. Cleanse needs skipTurnCount>0)
applyCardSideEffect(card, context, engine) 
  // context: { targetPlayerId?, row?, col? }
  // Handles: SHIELD (set cell.shieldCount++), SKIP_TURN (target.skipTurnCount++),
  //          CLEANSE (self.skipTurnCount--), EXTRA_TURN (self.extraTurnCount++)
applyCardImmediate(card, board, players)
  // RANDOM_CLEAR3: pick 3 random occupied cells, clear respecting shields
  // SHAKE: Fisher-Yates on ownerIds, retry ≤50× until WinDetector finds no wins
```

---

## Phase 3 — GameEngine Integration

### `src/core/GameEngine.js` — changes

**State additions:**
```js
gameMode = GameMode.CLASSIC
deck = []
hands = {}          // { [playerId]: Card[] }
activeCard = null   // card currently in DEFERRED state
```

**`startGame(players, gameMode)`**
- if ADVANCED: `this.deck = cardEngine.buildDeck()`; init empty hands; initial state = `CARD_PHASE`; check skip effects for first player
- if CLASSIC: state = `ROLLING` (unchanged)

**New methods:**
```js
drawCard()
  // Guard: CARD_PHASE, deck not empty, hand not full
  // → cardEngine.drawCard(deck, currentPlayer)
  // → emit 'card-drawn'
  // → transition: ROLLING

useCard(cardId, context = {})
  // Guard: CARD_PHASE, card in hand
  // Remove card from hand, add to discardPile
  // SIDE_EFFECT → applyCardSideEffect → ROLLING
  // IMMEDIATE   → applyCardImmediate  → _advanceTurn()
  // DEFERRED    → this.activeCard = card → ROLLING
  // → emit 'card-used'

skipCardInteraction()
  // Guard: CARD_PHASE
  // → ROLLING
```

**`rollDice()` — unchanged** (state check already guards ROLLING)

**`makeMove({ row, col })` — additions**
- Before applying move: check if candidate cell has `shieldCount > 0` for CAPTURE → shield blocks
- If `activeCard === EXPLOSION4`: clear 2×2 area from (row, col) → emit `explosion-cleared` → no mark → `_advanceTurn()`
- If `activeCard` is ROW/COL/AREA: place mark at (row, col) → emit `move-made` → win check → `_advanceTurn()`
- Clear `activeCard` after deferred use

**`_advanceTurn()` — new private helper**
```js
// After any move or immediate-card-use:
// 1. Win check (skip for non-placement cards)
// 2. If currentPlayer.extraTurnCount > 0: extraTurnCount--, re-enter CARD_PHASE for same player
// 3. Else: advance currentPlayerIndex, check new player's skipTurnCount
//    → if skipTurnCount > 0: skipTurnCount--, emit turn-skipped, advance again (recurse)
//    → enter CARD_PHASE (ADVANCED) or ROLLING (CLASSIC)
```

**New events emitted by GameEngine:**
`card-drawn`, `card-used`, `card-skipped`, `shield-blocked`, `explosion-cleared`, `shake-applied`, `random-cleared`, `turn-skipped`

### `src/core/MoveEvaluator.js` — additions

New method (or modify `evaluate`):
```js
evaluateWithCard(roll, board, playerId, activeCard)
  // If no activeCard: existing evaluate()
  // ROW_MARK: candidates = all cells in rows [d1, d2] where ownerId !== playerId
  // COL_MARK: candidates = all cells in cols [d1, d2] where ownerId !== playerId
  // AREA_3X3: cells in 3×3 centered on (d1, d2), clamped to board, ownerId !== playerId
  // EXPLOSION4: valid 2×2 top-left corners s.t. anchor is within board and 2×2 area
  //   contains (d1, d2) cell; action = CellAction.EXPLODE
```

For AREA_3X3 clamped bounds: `rows max(0, d1-1)..min(BOARD_SIZE-1, d1+1)`, same for cols.
For EXPLOSION4 anchors: `r ∈ [max(0, d1-1), min(BOARD_SIZE-2, d1)]`, same for c w/ d2.

---

## Phase 4 — Services

### `src/services/LocalGameService.js`
- Pass `gameMode` to `engine.startGame(players, gameMode)`
- Include `deck`, `hands`, `activeCard`, `playerEffects (skipTurnCount, extraTurnCount)`, `cellShields` in the serialized localStorage snapshot
- Expose new engine methods: `drawCard()`, `useCard()`, `skipCardInteraction()`

### `src/services/FirebaseGameService.js`
- Same API additions as LocalGameService
- Sync `gameState.deck`, `gameState.hands` (all hands; UI only renders own), `gameState.activeCard`, player effects, cell shields to Firebase
- Only current player can call card methods (existing `isMyTurn` guard)
- `hands` is stored as `{ [playerId]: Card[] }` in shared state — other players' hands are not rendered in UI (soft privacy, acceptable for casual game)

### `src/firebase/roomService.js`
- No structural changes needed; `pushGameState` already handles full state sync

---

## Phase 5 — Settings & Setup

### `src/stores/settingsStore.js`
- Add `gameMode: ref(GameMode.CLASSIC)`
- Pass `gameMode` to `startGame` call

### `src/components/setup/GameSetup.vue`
- Add a mode toggle: **Classic** / **Advanced** (two buttons, similar to existing player-count picker)
- Store choice in `settingsStore.gameMode`

---

## Phase 6 — Store & UI

### `src/stores/gameStore.js` — additions
```js
// Computed
isCardPhase         // state === 'CARD_PHASE'
myHand              // service.state.hands?.[myPlayerId] ?? []
deckSize            // service.state.deck?.length ?? 0
activeCard          // service.state.activeCard

// Actions (delegate to service)
drawCard()
useCard(cardId, context)
skipCardInteraction()
```

### `src/components/game/CardPhasePanel.vue` (new)
Shown only when `isCardPhase && myTurn`. Three buttons:
- **Draw** (disabled if deck empty or hand full)
- **Use card** (disabled if hand empty) — expands hand, player clicks a card to select then optionally clicks board
- **Skip**

For SIDE_EFFECT cards that need board input (Shield → click own cell, Skip Turn → click player avatar): show selection overlay after card chosen.

### `src/components/game/CardHand.vue` (new)
Renders the current player's hand as a horizontal card strip (shown only during own turn). Each card: color-coded chip with name. Clicking a card in hand "selects" it for use via CardPhasePanel.

### `src/views/GameView.vue`
- Mount `CardPhasePanel` and `CardHand` inside the game layout
- Pass `isCandidateCell` / `getCandidateAction` from store (already reactive to EXPLOSION4 anchors via updated MoveEvaluator)

### `src/components/game/GameCell.vue`
- Add styling for `action-EXPLODE` (distinct from CAPTURE — e.g. orange glow)

### `src/i18n/locales/en.js` + `ru.js`
Add keys under `cards.*`:
- Card names + descriptions for all 10 cards
- UI strings: `cards.draw`, `cards.skip`, `cards.useCard`, `cards.deckEmpty`, `cards.handFull`, `cards.selectTarget`, etc.

---

## Critical Files Modified

| File | Change |
|------|--------|
| `src/core/constants.js` | GameMode, CardType, CARD_PHASE state, EXPLODE action, DECK_SIZE, MAX_HAND_SIZE |
| `src/core/models/Player.js` | hand, skipTurnCount, extraTurnCount |
| `src/core/models/Cell.js` | shieldCount |
| `src/core/GameEngine.js` | CARD_PHASE state machine, card methods, _advanceTurn, shield/explosion logic |
| `src/core/MoveEvaluator.js` | evaluateWithCard() |
| `src/stores/settingsStore.js` | gameMode |
| `src/stores/gameStore.js` | card computeds + actions |
| `src/services/LocalGameService.js` | pass gameMode, expose card methods, persist new state |
| `src/services/FirebaseGameService.js` | same + sync new state fields |
| `src/components/setup/GameSetup.vue` | mode picker |
| `src/views/GameView.vue` | card UI integration |
| `src/components/game/GameCell.vue` | EXPLODE styling |
| `src/i18n/locales/en.js` + `ru.js` | card translations |

New files: `src/core/cards.js`, `src/core/cards_deck.js`, `src/core/CardEngine.js`, `src/components/game/CardPhasePanel.vue`, `src/components/game/CardHand.vue`

---

## Verification

1. `npm run test:unit` — existing tests must pass; add unit tests for:
   - `CardEngine.buildDeck()` — correct count, shuffled
   - `MoveEvaluator.evaluateWithCard()` — ROW_MARK, EXPLOSION4 candidates, edge-clamping
   - Shield blocking logic in `GameEngine`
   - `_advanceTurn()` skip/extra-turn chains
2. `npm run dev` — manual testing:
   - Classic mode: existing gameplay unchanged
   - Advanced mode setup toggle visible
   - CARD_PHASE panel appears on own turn
   - Draw card → appears in hand → use expanding card → roll → only expanded cells highlighted
   - Explosion 4: use card → roll [3,3] → board shows EXPLODE anchors → click one → 4 cells cleared
   - Random Clear 3: use → 3 pieces removed immediately → turn ends (no roll)
   - Shield: use → click own piece → shield indicator visible → opponent roll on that cell → shield decrements
   - Skip Turn: use on Player 2 → Player 2's next turn auto-skips
   - Extra Turn: use → complete normal move → same player's CARD_PHASE again
   - Shake: use → pieces redistributed with no winning combination
   - Online mode: both players see card phase UI; hands private (others' cards not rendered)
