export const DECK_CONFIG = [
  // { cardId: 'ROW_MARK', count: 4 },
  // { cardId: 'COL_MARK', count: 4 },
  // { cardId: 'AREA_3X3', count: 3 },
  // { cardId: 'SHIELD', count: 3 },
  // { cardId: 'EXPLOSION4', count: 20 },
  { cardId: 'SKIP_TURN', count: 30 },
  // { cardId: 'CLEANSE', count: 3 },
  { cardId: 'EXTRA_TURN', count: 20 },
  // { cardId: 'RANDOM_CLEAR3', count: 2 },
  // { cardId: 'SHAKE', count: 2 }
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
