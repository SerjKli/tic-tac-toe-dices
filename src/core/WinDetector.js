import { WIN_LENGTH } from './constants.js'

/**
 * Checks whether playerId has WIN_LENGTH consecutive marks in any direction.
 * @returns {{ winner: string, cells: Array<{row,col}> } | null}
 */
export function checkWin(board, playerId) {
  const size = board.size
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal ↘
    [1, -1]   // diagonal ↙
  ]

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      for (const [dr, dc] of directions) {
        const cells = []
        for (let k = 0; k < WIN_LENGTH; k++) {
          const r = row + dr * k
          const c = col + dc * k
          if (r < 0 || r >= size || c < 0 || c >= size) break
          if (board.getCell(r, c).ownerId !== playerId) break
          cells.push({ row: r, col: c })
        }
        if (cells.length === WIN_LENGTH) {
          return { winner: playerId, cells }
        }
      }
    }
  }
  return null
}
