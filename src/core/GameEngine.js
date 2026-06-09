import { Board } from './models/Board.js'
import { rollDice } from './Dice.js'
import { evaluate } from './MoveEvaluator.js'
import { checkWin } from './WinDetector.js'
import { GameState, CellAction } from './constants.js'

export class GameEngine extends EventTarget {
  constructor() {
    super()
    this.state = GameState.IDLE
    this.board = null
    this.players = []
    this.currentPlayerIndex = 0
    this.lastRoll = null
    this.lastEvaluation = null
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  startGame(players) {
    this.players = players
    this.board = new Board()
    this.currentPlayerIndex = 0
    this._transition(GameState.ROLLING)
  }

  rollDice() {
    if (this.state !== GameState.ROLLING) return
    const roll = rollDice()
    this.lastRoll = roll
    const evaluation = evaluate(roll, this.board, this._currentPlayer().id)
    this.lastEvaluation = evaluation
    this._emit('dice-rolled', { roll, evaluation, player: this._currentPlayer() })

    this._transition(GameState.CHOOSING)
  }

  skipTurn() {
    if (this.state !== GameState.CHOOSING || !this.lastEvaluation?.mustSkip) return
    this._emit('turn-skipped', { player: this._currentPlayer() })
    this.lastEvaluation = null
    this.lastRoll = null
    this._nextTurn(false)
  }

  makeMove({ row, col }) {
    if (this.state !== GameState.CHOOSING) return
    const candidate = this.lastEvaluation.candidates.find(c => c.row === row && c.col === col)
    if (!candidate || candidate.action === CellAction.BLOCKED) return

    const player = this._currentPlayer()

    const isDoubles = this.lastEvaluation.isDoubles

    if (candidate.action === CellAction.CAPTURE) {
      this.board.setOwner(row, col, null)
      this._emit('piece-captured', { row, col, by: player })
    } else {
      // PLACE
      this.board.setOwner(row, col, player.id)
      this._emit('move-made', { row, col, player })

      const win = checkWin(this.board, player.id)

      if (win) {
        this.lastEvaluation = null
        this._transition(GameState.GAME_OVER)
        this._emit('game-won', { winner: player, cells: win.cells })
        return
      }
    }

    this.lastEvaluation = null
    this.lastRoll = null
    this._nextTurn(isDoubles)
  }

  resetGame() {
    this.state = GameState.IDLE
    this.board = null
    this.players = []
    this.currentPlayerIndex = 0
    this.lastRoll = null
    this.lastEvaluation = null
  }

  // ── Getters ─────────────────────────────────────────────────────────────────

  get snapshot() {
    return {
      state: this.state,
      board: this.board,
      players: this.players,
      currentPlayer: this._currentPlayer(),
      lastRoll: this.lastRoll,
      lastEvaluation: this.lastEvaluation
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _currentPlayer() {
    return this.players[this.currentPlayerIndex]
  }

  _transition(newState) {
    this.state = newState
  }

  _nextTurn(isExtraTurn) {
    if (isExtraTurn) {
      this._emit('extra-turn', { player: this._currentPlayer() })
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    }
    this._transition(GameState.ROLLING)
  }

  _emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }
}
