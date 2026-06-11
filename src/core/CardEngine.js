import { CARDS } from './cards.js'
import { buildDeck } from './cards_deck.js'
import { MAX_HAND_SIZE } from './constants.js'
import { checkWin } from './WinDetector.js'

export class CardEngine {
  buildDeck() {
    return buildDeck()
  }

  drawCard(deck, player) {
    if (deck.length === 0 || player.hand.length >= MAX_HAND_SIZE) return null
    const entry = deck.shift()
    player.hand.push(entry)
    return entry
  }

  canUseCard(card, player) {
    const def = CARDS[card.cardId]
    if (!def) return false
    if (def.id === 'CLEANSE') return player.skipTurnCount > 0
    return true
  }

  applyCardSideEffect(card, context, { board, players, currentPlayer }) {
    const def = CARDS[card.cardId]
    switch (def.id) {
      case 'SHIELD': {
        const { row, col } = context
        if (row != null && col != null) {
          board.grid[row][col].shieldCount++
        }
        break
      }
      case 'SKIP_TURN': {
        const target = players.find(p => p.id === context.targetPlayerId)
        if (target) target.skipTurnCount++
        break
      }
      case 'CLEANSE': {
        if (currentPlayer.skipTurnCount > 0) currentPlayer.skipTurnCount--
        break
      }
      case 'EXTRA_TURN': {
        currentPlayer.extraTurnCount++
        break
      }
    }
  }

  applyCardImmediate(card, board, players) {
    const def = CARDS[card.cardId]
    const events = []

    if (def.id === 'RANDOM_CLEAR3') {
      const occupied = board.cells().filter(c => c.ownerId !== null)
      const count = Math.min(3, occupied.length)
      const picked = this._sample(occupied, count)
      for (const cell of picked) {
        if (cell.shieldCount > 0) {
          cell.shieldCount--
          events.push({ type: 'shield-blocked', row: cell.row, col: cell.col })
        } else {
          cell.ownerId = null
          events.push({ type: 'random-cleared', row: cell.row, col: cell.col })
        }
      }
    }

    if (def.id === 'SHAKE') {
      const occupied = board.cells().filter(c => c.ownerId !== null)
      if (occupied.length > 0) {
        const ownerIds = occupied.map(c => c.ownerId)
        let shuffled
        let attempts = 0
        do {
          shuffled = [...ownerIds]
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
          }
          attempts++
          if (attempts > 50) break
        } while (players.some(p => checkWin(this._boardWithOwners(board, occupied, shuffled), p.id)))

        occupied.forEach((cell, i) => { cell.ownerId = shuffled[i] })
        events.push({ type: 'shake-applied' })
      }
    }

    return events
  }

  _sample(arr, n) {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy.slice(0, n)
  }

  _boardWithOwners(board, cells, ownerIds) {
    const b = board.clone()
    cells.forEach((cell, i) => {
      b.grid[cell.row][cell.col].ownerId = ownerIds[i]
    })
    return b
  }
}
