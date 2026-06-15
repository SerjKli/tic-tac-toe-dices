import {CardId} from "@/core/constants.js";

export const DECK_CONFIG = [
  // { cardId: CardId.ROW_MARK, count: 4 },
  // { cardId: CardId.COL_MARK, count: 4 },
  // { cardId: CardId.AREA_3X3, count: 3 },
  // { cardId: CardId.SHIELD, count: 3 },
  // { cardId: CardId.EXPLOSION4, count: 2 },
  { cardId: CardId.SKIP_TURN, count: 30 },
  // { cardId: CardId.CLEANSE, count: 3 },
  // { cardId: CardId.EXTRA_TURN, count: 2 },
  // { cardId: CardId.RANDOM_CLEAR3, count: 2 },
  // { cardId: CardId.SHAKE, count: 2 }
  // total = 28 = DECK_SIZE
]

export function buildDeck() {
  const deck = []
  let instanceCounter = 0
  for (const { cardId, count } of DECK_CONFIG) {
    for (let i = 0; i < count; i++) {
      deck.push({ instanceId: `${cardId}_${instanceCounter++}`, cardId })
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}
