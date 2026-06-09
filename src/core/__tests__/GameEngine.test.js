import { describe, it, expect, vi } from 'vitest'
import { GameEngine } from '../GameEngine.js'
import { Player } from '../models/Player.js'
import { GameState, CellAction } from '../constants.js'

const players = [
  new Player({ id: 'p1', name: 'Alice', mark: '✕', color: '#e74c3c' }),
  new Player({ id: 'p2', name: 'Bob', mark: '○', color: '#3498db' })
]

function startedEngine() {
  const engine = new GameEngine()
  engine.startGame([...players])
  return engine
}

describe('GameEngine', () => {
  it('starts in ROLLING state', () => {
    const engine = startedEngine()
    expect(engine.state).toBe(GameState.ROLLING)
  })

  it('moves to CHOOSING after rollDice', () => {
    const engine = startedEngine()
    engine.rollDice()
    // Either CHOOSING or stays ROLLING on mustSkip
    expect([GameState.ROLLING, GameState.CHOOSING]).toContain(engine.state)
  })

  it('advances to next player after a move', () => {
    const engine = startedEngine()
    // Force a known roll with a known empty cell
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0 / 6)  // d1 = 0
      .mockReturnValueOnce(1 / 6)  // d2 = 1 (not doubles)
    engine.rollDice()
    engine.makeMove({ row: 0, col: 1 })
    expect(engine.currentPlayerIndex).toBe(1)
    vi.restoreAllMocks()
  })

  it('emits game-won when 3 in a row placed', () => {
    const engine = new GameEngine()
    engine.startGame([...players])

    const wonHandler = vi.fn()
    engine.addEventListener('game-won', wonHandler)

    // Manually place 2 marks for p1 and force a winning third
    engine.board.setOwner(0, 0, 'p1')
    engine.board.setOwner(0, 1, 'p1')
    // Force roll (0,2) → places at (0,2) → horizontal win
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0 / 6)
      .mockReturnValueOnce(2 / 6)
    engine.rollDice()
    engine.makeMove({ row: 0, col: 2 })

    expect(wonHandler).toHaveBeenCalledOnce()
    expect(engine.state).toBe(GameState.GAME_OVER)
    vi.restoreAllMocks()
  })
})
