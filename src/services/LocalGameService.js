import { reactive } from 'vue'
import { GameEngine } from '../core/GameEngine.js'
import { GameState, GameMode } from '../core/constants.js'
import { Board } from '../core/models/Board.js'
import { Cell } from '../core/models/Cell.js'
import { Player } from '../core/models/Player.js'

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
      winCells: [],
      gameMode: GameMode.CLASSIC,
      deck: [],
      activeCard: null,
      pendingCardId: null
    })
    this._bindEngineEvents()
    this._restore()
  }

  startGame({ players, gameMode = GameMode.CLASSIC }) {
    this.state.winnerPlayer = null
    this.state.winCells = []
    this._engine.startGame(players, gameMode)
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

  drawCard() {
    this._engine.drawCard()
    this._syncState()
  }

  useCard(cardId, context = {}) {
    this._engine.useCard(cardId, context)
    this._syncState()
  }

  skipCardInteraction() {
    this._engine.skipCardInteraction()
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
    this.state.players = snap.players.map(p => p.clone())
    this.state.currentPlayer = snap.currentPlayer ? snap.currentPlayer.clone() : null
    this.state.lastRoll = snap.lastRoll
    this.state.lastEvaluation = snap.lastEvaluation
    this.state.gameMode = snap.gameMode
    this.state.deck = snap.deck
    this.state.activeCard = snap.activeCard
    this.state.pendingCardId = snap.pendingCardId
    this._save()
  }

  _save() {
    if (this._engine.state === GameState.IDLE) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gameState: this._engine.state,
        board: this._engine.board
          ? this._engine.board.grid.map(row =>
              row.map(c => ({ row: c.row, col: c.col, ownerId: c.ownerId, shieldCount: c.shieldCount ?? 0 }))
            )
          : null,
        players: this._engine.players,
        currentPlayerIndex: this._engine.currentPlayerIndex,
        lastRoll: this._engine.lastRoll,
        lastEvaluation: this._engine.lastEvaluation,
        winnerPlayer: this.state.winnerPlayer,
        winCells: this.state.winCells,
        gameMode: this._engine.gameMode,
        deck: this._engine.deck,
        activeCard: this._engine.activeCard,
        pendingCardId: this._engine.pendingCardId
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
      this._engine.players = (data.players ?? []).map(p => {
        const player = new Player({ id: p.id, name: p.name, mark: p.mark, color: p.color })
        player.hand = p.hand ?? []
        player.skipTurnCount = p.skipTurnCount ?? 0
        player.extraTurnCount = p.extraTurnCount ?? 0
        return player
      })
      this._engine.currentPlayerIndex = data.currentPlayerIndex ?? 0
      this._engine.lastRoll = data.lastRoll ?? null
      this._engine.lastEvaluation = data.lastEvaluation ?? null
      this._engine.gameMode = data.gameMode ?? GameMode.CLASSIC
      this._engine.deck = data.deck ?? []
      this._engine.activeCard = data.activeCard ?? null
      this._engine.pendingCardId = data.pendingCardId ?? null

      this.state.winnerPlayer = data.winnerPlayer ?? null
      this.state.winCells = data.winCells ?? []
      this._syncState()
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  _boardFromData(grid) {
    const b = new Board(grid.length)
    b.grid = grid.map(row => row.map(c => new Cell(c.row, c.col, c.ownerId, c.shieldCount ?? 0)))
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
