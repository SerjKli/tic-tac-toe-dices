import { getCandidates } from './Dice.js'
import { CellAction, BOARD_SIZE } from './constants.js'
import { CARDS } from './cards.js'

/**
 * @param {[number,number]} roll  [d1, d2] from rollDice()
 * @param {Board} board
 * @param {string} playerId
 * @returns {{ candidates: Array<{row,col,action}>, isDoubles: boolean, mustSkip: boolean }}
 */
export function evaluate(roll, board, playerId) {
  const [d1, d2] = roll
  const isDoubles = d1 === d2
  const rawCandidates = getCandidates(d1, d2)

  const candidates = rawCandidates.map(({ row, col }) => {
    const cell = board.getCell(row, col)
    let action
    if (cell.ownerId === null) {
      action = CellAction.PLACE
    } else if (cell.ownerId === playerId) {
      action = CellAction.BLOCKED
    } else {
      action = CellAction.CAPTURE
    }
    return { row, col, action }
  })

  const mustSkip = candidates.every(c => c.action === CellAction.BLOCKED)

  return { candidates, isDoubles, mustSkip }
}

/**
 * Evaluate candidates when a DEFERRED card is active.
 * @param {[number,number]} roll
 * @param {Board} board
 * @param {string} playerId
 * @param {{ cardId: string }} activeCard
 * @returns {{ candidates: Array<{row,col,action}>, isDoubles: boolean, mustSkip: boolean }}
 */
export function evaluateWithCard(roll, board, playerId, activeCard) {
  if (!activeCard) return evaluate(roll, board, playerId)

  const [d1, d2] = roll
  const isDoubles = d1 === d2
  const def = CARDS[activeCard.cardId]
  let candidates = []

  if (def.id === 'ROW_MARK') {
    const rows = isDoubles ? [d1] : [d1, d2]
    for (const r of rows) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = board.getCell(r, c)
        if (cell.ownerId !== playerId) {
          candidates.push({ row: r, col: c, action: cell.ownerId === null ? CellAction.PLACE : CellAction.CAPTURE })
        }
      }
    }
  } else if (def.id === 'COL_MARK') {
    const cols = isDoubles ? [d2] : [d1, d2]
    for (const c of cols) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        const cell = board.getCell(r, c)
        if (cell.ownerId !== playerId) {
          candidates.push({ row: r, col: c, action: cell.ownerId === null ? CellAction.PLACE : CellAction.CAPTURE })
        }
      }
    }
  } else if (def.id === 'AREA_3X3') {
    const rMin = Math.max(0, d1 - 1)
    const rMax = Math.min(BOARD_SIZE - 1, d1 + 1)
    const cMin = Math.max(0, d2 - 1)
    const cMax = Math.min(BOARD_SIZE - 1, d2 + 1)
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const cell = board.getCell(r, c)
        if (cell.ownerId !== playerId) {
          candidates.push({ row: r, col: c, action: cell.ownerId === null ? CellAction.PLACE : CellAction.CAPTURE })
        }
      }
    }
  } else if (def.id === 'EXPLOSION4') {
    // Valid 2×2 top-left anchors: anchor must be within board and 2×2 area must contain (d1, d2)
    const rMin = Math.max(0, d1 - 1)
    const rMax = Math.min(BOARD_SIZE - 2, d1)
    const cMin = Math.max(0, d2 - 1)
    const cMax = Math.min(BOARD_SIZE - 2, d2)
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        candidates.push({ row: r, col: c, action: CellAction.EXPLODE })
      }
    }
  } else {
    return evaluate(roll, board, playerId)
  }

  // Deduplicate by row+col
  const seen = new Set()
  candidates = candidates.filter(({ row, col }) => {
    const key = `${row},${col}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const mustSkip = candidates.length === 0

  return { candidates, isDoubles, mustSkip }
}
