# Plan: Turn Phase Architecture — Single Source of Truth for Current Player Action

## Context

The game already has a working `GameState` enum (`CARD_PHASE`, `ROLLING`, `CHOOSING`) in `GameEngine`, but the store exposes it as three separate booleans (`isRolling`, `isChoosing`, `isCardPhase`) and the UI in `GameView.vue` derives status messages through a tangle of `v-if` conditions (lines 46–62). There is no unified "what is the active player doing right now" concept available to non-active players — they see only "Waiting for X…" with no action context. The goal is to add a `currentTurnAction` computed as a single source of truth, drive all status messages from it, and make adding future phases a one-step operation.

---

## Changes

### 1. `src/core/constants.js` — Add `TurnAction` enum

```js
export const TurnAction = Object.freeze({
  SELECT_CARD: 'SELECT_CARD',
  ROLL_DICE:   'ROLL_DICE',
  SELECT_CELL: 'SELECT_CELL',
})
```

Kept separate from `GameState` intentionally: `GameState` is an internal engine concept; `TurnAction` is the user-facing required action. Future engine states may not map 1:1 to user actions.

---

### 2. `src/stores/gameStore.js` — Add `currentTurnAction` computed

Import `TurnAction` alongside `GameState`. Add a computed:

```js
const currentTurnAction = computed(() => {
  switch (state.gameState) {
    case GameState.CARD_PHASE: return TurnAction.SELECT_CARD
    case GameState.ROLLING:    return TurnAction.ROLL_DICE
    case GameState.CHOOSING:   return TurnAction.SELECT_CELL
    default:                   return null
  }
})
```

Expose `currentTurnAction` in the return object. Keep existing `isRolling`, `isChoosing`, `isCardPhase` booleans — components still use them for control visibility (CardPhasePanel, DiceRoller, etc.).

---

### 3. `src/i18n/locales/en.js` and `ru.js` — Add turn action message keys

Add inside the `game` section:

**en.js:**
```js
turnAction: {
  selectCard:       'Select a card',
  rollDice:         'Roll the dice',
  selectCell:       'Choose a cell',
  playerSelectCard: '{name} is selecting a card',
  playerRollDice:   '{name} is rolling the dice',
  playerSelectCell: '{name} is choosing a cell',
}
```

**ru.js:**
```js
turnAction: {
  selectCard:       'Выберите карту',
  rollDice:         'Бросьте кубики',
  selectCell:       'Выберите клетку',
  playerSelectCard: '{name} выбирает карту',
  playerRollDice:   '{name} бросает кубики',
  playerSelectCell: '{name} выбирает клетку',
}
```

---

### 4. `src/views/GameView.vue` — Replace scattered hints with action-driven computed

Add two computed properties in `<script setup>`:

```js
// Message for the active (local) player
const myActionMessage = computed(() => {
  if (!game.currentTurnAction) return null
  if (game.canSkip) return null  // handled by existing skip UI
  if (game.boardTargetCardId) return null  // handled by shield hint
  const map = {
    [TurnAction.SELECT_CARD]: t('game.turnAction.selectCard'),
    [TurnAction.ROLL_DICE]:   t('game.turnAction.rollDice'),
    [TurnAction.SELECT_CELL]: t('game.turnAction.selectCell'),
  }
  return map[game.currentTurnAction] ?? null
})

// Message shown to non-active players (observer view)
const activePlayerActionMessage = computed(() => {
  const name = game.state.currentPlayer?.name ?? '…'
  const map = {
    [TurnAction.SELECT_CARD]: t('game.turnAction.playerSelectCard', { name }),
    [TurnAction.ROLL_DICE]:   t('game.turnAction.playerRollDice',   { name }),
    [TurnAction.SELECT_CELL]: t('game.turnAction.playerSelectCell', { name }),
  }
  return game.currentTurnAction ? map[game.currentTurnAction] : t('game.waitingForPlayer', { name })
})
```

Replace lines 50–62 in the template with:

```html
<template v-if="game.myTurn || !game.isOnline">
  <template v-if="game.canSkip">
    <p class="hint">{{ t('game.allCellsOwned') }}</p>
    <button class="skip-btn" @click="game.skipTurn()">{{ t('game.skipTurn') }}</button>
  </template>
  <p v-else-if="myActionMessage" class="hint">{{ myActionMessage }}</p>
</template>

<div v-if="game.isOnline && !game.myTurn && !game.isOver" class="waiting-overlay">
  <p class="waiting-msg">{{ activePlayerActionMessage }}</p>
</div>
```

Keep the doubles notice (line 46) and shield hint (line 48) exactly as-is — they are not part of the action flow.

---

## Extensibility Pattern

To add a new phase (e.g. `TRADE_RESOURCES`):
1. Add `TRADE_RESOURCES: 'TRADE_RESOURCES'` to `TurnAction` in `constants.js`
2. Add case in `currentTurnAction` switch in `gameStore.js`
3. Add `game.turnAction.tradeResources` and `game.turnAction.playerTradeResources` to both i18n files
4. The map objects in `GameView.vue` computed properties pick it up automatically

No existing phase logic needs touching.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/core/constants.js` | Add `TurnAction` enum |
| `src/stores/gameStore.js` | Import `TurnAction`, add `currentTurnAction` computed, expose it |
| `src/i18n/locales/en.js` | Add `game.turnAction.*` keys |
| `src/i18n/locales/ru.js` | Add `game.turnAction.*` keys |
| `src/views/GameView.vue` | Replace scattered hints (lines 50–62) with action-driven computeds |

No changes to `GameEngine.js`, `CardEngine.js`, or any component except `GameView.vue`.

---

## Verification

1. `npm run dev` — play a full local game in Advanced mode:
   - During card phase: hint reads "Select a card" (or Russian equivalent)
   - After draw/skip card: hint reads "Roll the dice"
   - After roll: hint reads "Choose a cell"
2. Online mode (two browser tabs or two players): non-active player's waiting overlay shows "X is rolling the dice" / "X is selecting a card" / "X is choosing a cell" matching the active state
3. Classic mode: card phase never appears, RollDice and SelectCell messages still work
4. `npm run test:unit` — existing tests still pass
