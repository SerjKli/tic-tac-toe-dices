import { describe, it, expect } from 'vitest'
import { evaluate } from '../MoveEvaluator.js'
import { Board } from '../models/Board.js'
import { CellAction } from '../constants.js'

function makeBoard(placements = []) {
  const b = new Board()
  for (const { row, col, ownerId } of placements) {
    b.setOwner(row, col, ownerId)
  }
  return b
}

describe('evaluate', () => {
  it('returns PLACE for empty cells', () => {
    const board = makeBoard()
    const { candidates } = evaluate([0, 1], board, 'p1')
    expect(candidates.every(c => c.action === CellAction.PLACE)).toBe(true)
  })

  it('returns CAPTURE when opponent occupies cell', () => {
    const board = makeBoard([{ row: 0, col: 1, ownerId: 'p2' }])
    const { candidates } = evaluate([0, 1], board, 'p1')
    const cap = candidates.find(c => c.row === 0 && c.col === 1)
    expect(cap.action).toBe(CellAction.CAPTURE)
  })

  it('returns BLOCKED when own mark occupies cell', () => {
    const board = makeBoard([{ row: 0, col: 1, ownerId: 'p1' }])
    const { candidates } = evaluate([0, 1], board, 'p1')
    const blocked = candidates.find(c => c.row === 0 && c.col === 1)
    expect(blocked.action).toBe(CellAction.BLOCKED)
  })

  it('detects doubles', () => {
    const board = makeBoard()
    const { isDoubles, candidates } = evaluate([3, 3], board, 'p1')
    expect(isDoubles).toBe(true)
    expect(candidates).toHaveLength(1)
  })

  it('mustSkip when both candidates blocked', () => {
    const board = makeBoard([
      { row: 0, col: 1, ownerId: 'p1' },
      { row: 1, col: 0, ownerId: 'p1' }
    ])
    const { mustSkip } = evaluate([0, 1], board, 'p1')
    expect(mustSkip).toBe(true)
  })
})
