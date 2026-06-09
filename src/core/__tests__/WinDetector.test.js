import { describe, it, expect } from 'vitest'
import { checkWin } from '../WinDetector.js'
import { Board } from '../models/Board.js'

function makeBoard(placements = []) {
  const b = new Board()
  for (const { row, col, ownerId } of placements) {
    b.setOwner(row, col, ownerId)
  }
  return b
}

describe('checkWin', () => {
  it('detects horizontal win', () => {
    const board = makeBoard([
      { row: 0, col: 0, ownerId: 'p1' },
      { row: 0, col: 1, ownerId: 'p1' },
      { row: 0, col: 2, ownerId: 'p1' }
    ])
    expect(checkWin(board, 'p1')).not.toBeNull()
  })

  it('detects vertical win', () => {
    const board = makeBoard([
      { row: 0, col: 0, ownerId: 'p1' },
      { row: 1, col: 0, ownerId: 'p1' },
      { row: 2, col: 0, ownerId: 'p1' }
    ])
    expect(checkWin(board, 'p1')).not.toBeNull()
  })

  it('detects diagonal win ↘', () => {
    const board = makeBoard([
      { row: 1, col: 1, ownerId: 'p1' },
      { row: 2, col: 2, ownerId: 'p1' },
      { row: 3, col: 3, ownerId: 'p1' }
    ])
    expect(checkWin(board, 'p1')).not.toBeNull()
  })

  it('detects diagonal win ↙', () => {
    const board = makeBoard([
      { row: 0, col: 2, ownerId: 'p1' },
      { row: 1, col: 1, ownerId: 'p1' },
      { row: 2, col: 0, ownerId: 'p1' }
    ])
    expect(checkWin(board, 'p1')).not.toBeNull()
  })

  it('returns null when no win', () => {
    const board = makeBoard([
      { row: 0, col: 0, ownerId: 'p1' },
      { row: 0, col: 1, ownerId: 'p1' }
    ])
    expect(checkWin(board, 'p1')).toBeNull()
  })

  it('does not award win to other player', () => {
    const board = makeBoard([
      { row: 0, col: 0, ownerId: 'p1' },
      { row: 0, col: 1, ownerId: 'p1' },
      { row: 0, col: 2, ownerId: 'p1' }
    ])
    expect(checkWin(board, 'p2')).toBeNull()
  })
})
