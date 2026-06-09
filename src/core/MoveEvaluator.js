import { getCandidates } from './Dice.js'
import { CellAction } from './constants.js'

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
