import { BOARD_SIZE } from './constants.js'

/** Returns [d1, d2] where each die is 0-based row or col index (1..BOARD_SIZE mapped to 0..size-1). */
export function rollDice() {
  const d1 = Math.floor(Math.random() * BOARD_SIZE)
  const d2 = Math.floor(Math.random() * BOARD_SIZE)
  return [d1, d2]
}

/**
 * Returns the two candidate cells from a roll.
 * On doubles both candidates are identical (same row+col).
 */
export function getCandidates(d1, d2) {
  if (d1 === d2) {
    return [{ row: d1, col: d2 }]
  }
  return [
    { row: d1, col: d2 },
    { row: d2, col: d1 }
  ]
}
