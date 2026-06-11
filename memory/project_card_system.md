---
name: project-card-system
description: Advanced mode card system implemented — 10 cards, CARD_PHASE state, CardEngine, shield/explosion/expand mechanics
metadata:
  type: project
---

Advanced card system fully implemented as of 2026-06-11.

**Why:** User requested an optional card-based mechanic (plan in plan_playing_cards.md) to add depth to the game. Implemented on the `card` branch.

**Key files added/changed:**
- `src/core/cards.js` — 10 card definitions (ROW_MARK, COL_MARK, AREA_3X3, SHIELD, EXPLOSION4, SKIP_TURN, CLEANSE, EXTRA_TURN, RANDOM_CLEAR3, SHAKE)
- `src/core/cards_deck.js` — DECK_CONFIG + buildDeck() with Fisher-Yates shuffle
- `src/core/CardEngine.js` — pure logic: drawCard, applyCardSideEffect, applyCardImmediate
- `src/core/constants.js` — added GameMode, CardType, CARD_PHASE, EXPLODE, DECK_SIZE, MAX_HAND_SIZE
- `src/core/models/Player.js` — added hand[], skipTurnCount, extraTurnCount
- `src/core/models/Cell.js` — added shieldCount
- `src/core/GameEngine.js` — full CARD_PHASE state machine, drawCard/useCard/skipCardInteraction, _advanceTurn, shield/explosion logic
- `src/core/MoveEvaluator.js` — added evaluateWithCard() for ROW_MARK, COL_MARK, AREA_3X3, EXPLOSION4
- `src/stores/gameStore.js` — isCardPhase, myHand, deckSize, activeCard, boardTargetCardId (for Shield cell-click targeting)
- `src/stores/settingsStore.js` — gameMode ref (CLASSIC/ADVANCED)
- `src/services/LocalGameService.js` + `FirebaseGameService.js` — drawCard/useCard/skipCardInteraction, gameMode sync
- `src/components/game/CardPhasePanel.vue` — card phase UI (draw/use/skip buttons, hand display, target selection)
- `src/components/game/CardHand.vue` — color-coded card chips
- `src/components/game/GameCell.vue` — EXPLODE styling (orange), shield badge (🛡️)
- `src/components/setup/GameSetup.vue` — Classic/Advanced mode toggle
- `src/views/GameView.vue` — CardPhasePanel integration, boardTargetCardId handling
- `src/firebase/roomService.js` — gameMode stored in room meta
- `src/i18n/locales/en.js` + `ru.js` — all card strings added

**How to apply:** When working on card logic or UI, all the relevant files are listed above. The shield targeting works via `boardTargetCardId` in gameStore — when set, cell clicks go to `useCard(cardId, {row,col})` instead of `makeMove`.
