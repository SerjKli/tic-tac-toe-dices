import { reactive } from 'vue'
import { GameEngine } from '../core/GameEngine.js'
import { GameState } from '../core/constants.js'
import { Board } from '../core/models/Board.js'
import { Cell } from '../core/models/Cell.js'

export const STORAGE_KEY = 'tic-toe:game'

export class LocalGameService {
  constructor() {
    this._engine = new GameEngine()
    this.state = reactive({
      gameState: GameState.IDLE,
      board: null,
      players: [],
      currentPlayer: null,
      lastRoll: null,
      lastEvaluation: null,
      winnerPlayer: null,
      winCells: []
    })
    this._bindEngineEvents()
    this._restore()
  }

  startGame({ players }) {
    this.state.winnerPlayer = null
    this.state.winCells = []
    this._engine.startGame(players)
    this._syncState()
  }

  rollDice() {
    this._engine.rollDice()
    this._syncState()
  }

  makeMove({ row, col }) {
    this._engine.makeMove({ row, col })
    this._syncState()
  }

  skipTurn() {
    this._engine.skipTurn()
    this._syncState()
  }

  resetGame() {
    this._engine.resetGame()
    this.state.winnerPlayer = null
    this.state.winCells = []
    localStorage.removeItem(STORAGE_KEY)
    this._syncState()
  }

  _syncState() {
    const snap = this._engine.snapshot
    this.state.gameState = snap.state
    this.state.board = snap.board ? snap.board.clone() : null
    this.state.players = snap.players
    this.state.currentPlayer = snap.currentPlayer
    this.state.lastRoll = snap.lastRoll
    this.state.lastEvaluation = snap.lastEvaluation
    this._save()
  }

  _save() {
    if (this._engine.state === GameState.IDLE) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gameState: this._engine.state,
        board: this._engine.board
          ? this._engine.board.grid.map(row =>
              row.map(c => ({ row: c.row, col: c.col, ownerId: c.ownerId }))
            )
          : null,
        players: this._engine.players,
        currentPlayerIndex: this._engine.currentPlayerIndex,
        lastRoll: this._engine.lastRoll,
        lastEvaluation: this._engine.lastEvaluation,
        winnerPlayer: this.state.winnerPlayer,
        winCells: this.state.winCells
      }))
    } catch {
      // storage unavailable or full
    }
  }

  _restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (!data || data.gameState === GameState.IDLE) return

      this._engine.state = data.gameState
      this._engine.board = data.board ? this._boardFromData(data.board) : null
      this._engine.players = data.players ?? []
      this._engine.currentPlayerIndex = data.currentPlayerIndex ?? 0
      this._engine.lastRoll = data.lastRoll ?? null
      this._engine.lastEvaluation = data.lastEvaluation ?? null

      this.state.winnerPlayer = data.winnerPlayer ?? null
      this.state.winCells = data.winCells ?? []
      this._syncState()
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  _boardFromData(grid) {
    const b = new Board(grid.length)
    b.grid = grid.map(row => row.map(c => new Cell(c.row, c.col, c.ownerId)))
    return b
  }

  _bindEngineEvents() {
    this._engine.addEventListener('game-won', ({ detail }) => {
      this.state.winnerPlayer = detail.winner
      this.state.winCells = detail.cells
      this._syncState()
    })
  }
}
