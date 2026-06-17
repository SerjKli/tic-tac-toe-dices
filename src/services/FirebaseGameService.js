import { reactive } from 'vue'
import { GameEngine } from '../core/GameEngine.js'
import { GameState, GameMode } from '../core/constants.js'
import { Board } from '../core/models/Board.js'
import { Cell } from '../core/models/Cell.js'
import {
  pushGameState,
  setRoomStatus,
  subscribeToGameState,
  unsubscribeGameState
} from '@backend'
import { clearRoomSession } from '../utils/identity.js'

export class FirebaseGameService {
  constructor(roomId, playerId, slotIndex) {
    this._roomId = roomId
    this._playerId = playerId
    this._slotIndex = slotIndex
    this._engine = new GameEngine()
    this._gsRef = null
    this.isOnline = true

    this.state = reactive({
      gameState: GameState.IDLE,
      board: null,
      players: [],
      currentPlayer: null,
      lastRoll: null,
      lastEvaluation: null,
      winnerPlayer: null,
      winCells: [],
      currentPlayerIndex: 0,
      gameMode: GameMode.CLASSIC,
      deck: [],
      activeCard: null,
      lastUsedCard: null
    })
  }

  setSlotIndex(n) {
    this._slotIndex = n
  }

  get isMyTurn() {
    return this.state.currentPlayerIndex === this._slotIndex
  }

  async startGame({ players, gameMode = GameMode.CLASSIC }) {
    this.state.winnerPlayer = null
    this.state.winCells = []
    this._engine.startGame(players, gameMode)
    this._bindEngineEvents()
    this._syncState()
    await this._pushSnapshot()
    this._subscribeToGameState()
  }

  rollDice() {
    if (!this.isMyTurn) return
    this._engine.rollDice()
    this._syncState()
    this._pushSnapshot()
  }

  makeMove({ row, col }) {
    if (!this.isMyTurn) return
    this._engine.makeMove({ row, col })
    this._syncState()
    this._pushSnapshot()
  }

  skipTurn() {
    if (!this.isMyTurn) return
    this._engine.skipTurn()
    this._syncState()
    this._pushSnapshot()
  }

  drawCard() {
    if (!this.isMyTurn) return
    this._engine.drawCard()
    this._syncState()
    this._pushSnapshot()
  }

  useCard(cardId, context = {}) {
    if (!this.isMyTurn) return
    this.state.lastUsedCard = { cardId, playerId: this._playerId, targetPlayerId: context.targetPlayerId ?? null, ts: Date.now() }
    this._engine.useCard(cardId, context)
    this._syncState()
    this._pushSnapshot()
  }

  hasReasonNotSelectCard(cardId) {
    return this._engine.hasReasonNotSelectCard(cardId)
  }

  skipCardInteraction() {
    if (!this.isMyTurn) return
    this._engine.skipCardInteraction()
    this._syncState()
    this._pushSnapshot()
  }

  confirmSkipTurn() {
    if (!this.isMyTurn) return
    this._engine.confirmSkipTurn()
    this._syncState()
    this._pushSnapshot()
  }

  useCleanseInSkipPhase() {
    if (!this.isMyTurn) return
    this._engine.useCleanseInSkipPhase()
    this._syncState()
    this._pushSnapshot()
  }


  resetGame() {
    this._engine.resetGame()
    this.state.winnerPlayer = null
    this.state.winCells = []
    setRoomStatus(this._roomId, 'finished')
    clearRoomSession()
    this._syncState()
    this._unsubscribeGameState()
  }

  subscribeToGameState() {
    this._subscribeToGameState()
  }

  _subscribeToGameState() {
    if (this._gsRef) return
    this._gsRef = subscribeToGameState(this._roomId, (data) => {
      if (!data) return
      if (data.currentPlayerIndex === this._slotIndex) {
        this._restoreEngine(data)
      }
      this._applySnapshot(data)
    })
  }

  _unsubscribeGameState() {
    if (this._gsRef) {
      unsubscribeGameState(this._gsRef)
      this._gsRef = null
    }
  }

  _restoreEngine(data) {
    this._engine.state = data.state
    this._engine.board = data.board ? this._boardFromData(data.board) : null
    this._engine.players = (data.players ?? []).map(p => ({
      ...p,
      hand: Array.isArray(p.hand) ? p.hand : [],
    }))
    this._engine.currentPlayerIndex = data.currentPlayerIndex ?? 0
    this._engine.lastRoll = data.lastRoll ?? null
    this._engine.lastEvaluation = data.lastEvaluation ?? null
    this._engine.gameMode = data.gameMode ?? GameMode.CLASSIC
    this._engine.deck = data.deck ?? []
    this._engine.activeCard = data.activeCard ?? null
    this._bindEngineEvents()
  }

  _applySnapshot(data) {
    this.state.gameState = data.state
    this.state.board = data.board ? this._boardFromData(data.board) : null
    this.state.players = data.players ?? []
    this.state.currentPlayerIndex = data.currentPlayerIndex ?? 0
    this.state.currentPlayer = (data.players ?? [])[data.currentPlayerIndex ?? 0] ?? null
    this.state.lastRoll = data.lastRoll ?? null
    this.state.lastEvaluation = data.lastEvaluation ?? null
    this.state.gameMode = data.gameMode ?? GameMode.CLASSIC
    this.state.deck = data.deck ?? []
    this.state.activeCard = data.activeCard ?? null
    this.state.lastUsedCard = data.lastUsedCard ?? null
    if (data.winnerIndex != null && data.players) {
      this.state.winnerPlayer = data.players[data.winnerIndex] ?? null
    }
    this.state.winCells = data.winCells ?? []
  }

  _syncState() {
    const snap = this._engine.snapshot
    this.state.gameState = snap.state
    this.state.board = snap.board ? snap.board.clone() : null
    this.state.players = snap.players
    this.state.currentPlayer = snap.currentPlayer
    this.state.currentPlayerIndex = this._engine.currentPlayerIndex
    this.state.lastRoll = snap.lastRoll
    this.state.lastEvaluation = snap.lastEvaluation
    this.state.gameMode = snap.gameMode
    this.state.deck = [...snap.deck]
    this.state.activeCard = snap.activeCard
  }

  _pushSnapshot() {
    const snap = this._engine.snapshot
    const boardData = snap.board
      ? snap.board.grid.map(row => row.map(c => ({
          row: c.row, col: c.col, ownerId: c.ownerId, shieldCount: c.shieldCount ?? 0
        })))
      : null

    const winnerIndex = this.state.winnerPlayer
      ? snap.players.findIndex(p => p.id === this.state.winnerPlayer?.id)
      : null

    const payload = JSON.parse(JSON.stringify({
      state: snap.state,
      board: boardData,
      players: snap.players,
      currentPlayerIndex: this._engine.currentPlayerIndex,
      lastRoll: snap.lastRoll,
      lastEvaluation: snap.lastEvaluation,
      winnerIndex,
      winCells: this.state.winCells,
      gameMode: snap.gameMode,
      deck: snap.deck,
      activeCard: snap.activeCard,
      lastUsedCard: this.state.lastUsedCard ?? null
    }))

    return pushGameState(this._roomId, payload)
  }

  _boardFromData(grid) {
    const b = new Board(grid.length)
    b.grid = grid.map(row => row.map(c => new Cell(c.row, c.col, c.ownerId, c.shieldCount ?? 0)))
    return b
  }

  _bindEngineEvents() {
    this._engine.removeEventListener('game-won', this._onGameWon)
    this._onGameWon = ({ detail }) => {
      this.state.winnerPlayer = detail.winner
      this.state.winCells = detail.cells
      this._syncState()
      this._pushSnapshot()
      setRoomStatus(this._roomId, 'finished')
    }
    this._engine.addEventListener('game-won', this._onGameWon)
  }
}
