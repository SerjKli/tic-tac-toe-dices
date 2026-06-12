import { Board } from './models/Board.js'
import { rollDice } from './Dice.js'
import { evaluate, evaluateWithCard } from './MoveEvaluator.js'
import { checkWin } from './WinDetector.js'
import {GameState, GameMode, CellAction, CardId, BOARD_SIZE} from './constants.js'
import { CardEngine } from './CardEngine.js'
import { CARDS } from './cards.js'

export class GameEngine extends EventTarget {
  constructor() {
    super()
    this.state = GameState.IDLE
    this.board = null
    this.players = []
    this.currentPlayerIndex = 0
    this.lastRoll = null
    this.lastEvaluation = null

    this.gameMode = GameMode.CLASSIC
    this.deck = []
    this.activeCard = null
    this.pendingCardId = null
    this._cardEngine = new CardEngine()
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  startGame(players, gameMode = GameMode.CLASSIC) {
    this.players = players
    this.board = new Board()
    this.currentPlayerIndex = 0
    this.lastRoll = null
    this.lastEvaluation = null
    this.gameMode = gameMode
    this.activeCard = null

    if (gameMode === GameMode.ADVANCED) {
      this.deck = this._cardEngine.buildDeck()
      for (const p of this.players) {
        p.hand = []
        p.skipTurnCount = 0
        p.extraTurnCount = 0
      }
      this._enterCardPhase()
    } else {
      this._transition(GameState.ROLLING)
    }

    // TODO: !remove in production
    // this.players[0].hand.push({'instanceId': "EXPLOSION4_12", 'cardId': "EXPLOSION4" });
    // this.players[0].hand.push({'instanceId': "EXPLOSION4_12", 'cardId': "EXPLOSION4" });
    // this.players[0].hand.push({'instanceId': "EXPLOSION4_12", 'cardId': "EXPLOSION4" });
    // this.players[0].hand.push({'instanceId': "SHIELD_12", 'cardId': "SHIELD" });
    // this.players[0].hand.push({'instanceId': "SHIELD_12", 'cardId': "SHIELD" });
    // this.players[0].hand.push({'instanceId': "SHIELD_12", 'cardId': "SHIELD" });
    // //
    // //
    // for(let r = 0; r < BOARD_SIZE; r++) {
    //   for (let c = 0; c < BOARD_SIZE; c++) {
    //     this.board.grid[r][c].ownerId = 'p1';
    //   }
    // }
  }

  // ── Card phase actions ──────────────────────────────────────────────────────

  drawCard() {
    if (this.state !== GameState.CARD_PHASE) return
    const player = this._currentPlayer()
    const entry = this._cardEngine.drawCard(this.deck, player)
    if (!entry) return
    this._emit('card-drawn', { card: entry, player })
    this._transition(GameState.ROLLING)
  }

  useCard(cardId, context = {}) {
    if (this.state !== GameState.CARD_PHASE) return
    const player = this._currentPlayer()
    const idx = player.hand.findIndex(c => c.cardId === cardId)
    if (idx === -1) return

    const def = CARDS[cardId]

    if (def.behavior === 'IMMEDIATE') {
      const card = player.hand.splice(idx, 1)[0]
      this._emit('card-used', { card, player, context })
      const events = this._cardEngine.applyCardImmediate(card, this.board, this.players)
      for (const ev of events) this._emit(ev.type, ev)
      if(cardId === CardId.SHAKE){
        this._transition(GameState.ROLLING)
      }else{
        // Skip rolling dice
        this._advanceTurn(false)
      }
      return
    }

    // SIDE_EFFECT and DEFERRED: keep card in hand until makeMove/skipTurn
    const card = player.hand[idx]
    this._emit('card-used', { card, player, context })
    this.pendingCardId = cardId

    if (def.behavior === 'SIDE_EFFECT') {
      this._cardEngine.applyCardSideEffect(card, context, {
        board: this.board,
        players: this.players,
        currentPlayer: player
      })
      this._transition(GameState.ROLLING)
    } else {
      this.activeCard = card
      this._transition(GameState.ROLLING)
    }
  }

  hasReasonNotSelectCard(cardId) {
    const player = this._currentPlayer()
    if (!player) return 'card.cantSelectReason.noPlayer'
    const entry = player.hand.find(c => c.cardId === cardId)
    if (!entry) return 'card.cantSelectReason.noCard'
    return this._cardEngine.hasReasonNotSelectCard(entry, player, { board: this.board })
  }

  skipCardInteraction() {
    if (this.state !== GameState.CARD_PHASE) return
    this._emit('card-skipped', { player: this._currentPlayer() })
    this._transition(GameState.ROLLING)
  }

  // ── Main turn actions ───────────────────────────────────────────────────────

  rollDice() {
    if (this.state !== GameState.ROLLING) return
    const roll = rollDice()
    this.lastRoll = roll
    const evaluation = this.activeCard
      ? evaluateWithCard(roll, this.board, this._currentPlayer().id, this.activeCard)
      : evaluate(roll, this.board, this._currentPlayer().id)
    this.lastEvaluation = evaluation
    this._emit('dice-rolled', { roll, evaluation, player: this._currentPlayer() })

    console.log(evaluation)
    if(evaluation.mustSkip){
      this._transition(GameState.SKIP_TURN_PHASE);
    }else{
    this._transition(GameState.CHOOSING)
    }


  }

  skipTurn() {
    if (this.state !== GameState.CHOOSING || !this.lastEvaluation?.mustSkip) return
    this._emit('turn-skipped', { player: this._currentPlayer() })
    this.lastEvaluation = null
    this.lastRoll = null
    this.activeCard = null
    this._removePendingCard()
    this._advanceTurn(false)
  }

  makeMove({ row, col }) {
    if (this.state !== GameState.CHOOSING) return
    const candidate = this.lastEvaluation.candidates.find(c => c.row === row && c.col === col)
    if (!candidate || candidate.action === CellAction.BLOCKED) return

    const player = this._currentPlayer()
    const isDoubles = this.lastEvaluation.isDoubles
    const card = this.activeCard
    this.activeCard = null
    this._removePendingCard()

    if (candidate.action === CellAction.EXPLODE) {
      // Clear 2×2 area from anchor (row, col), respecting shields
      const cleared = []

      const candidates = this.lastEvaluation.candidates;
      for (const candidate of candidates) {
        if(candidate.action !== CellAction.EXPLODE) return
        const r = candidate.row;
        const c = candidate.col;
        const cell = this.board.getCell(r, c)
        if (cell.shieldCount > 0) {
          cell.shieldCount--
          this._emit('shield-blocked', { row: r, col: c })
        } else if (cell.ownerId !== null) {
          this.board.setOwner(r, c, null)
          cleared.push({ row: r, col: c })
        }
      }
      this._emit('explosion-cleared', { anchor: { row, col }, cleared, player })
      this.lastEvaluation = null
      this.lastRoll = null
      this._advanceTurn(false)
      return
    }

    if (candidate.action === CellAction.CAPTURE) {
      const cell = this.board.getCell(row, col)
      if (cell.shieldCount > 0) {
        cell.shieldCount--
        this._emit('shield-blocked', { row, col })
        this.lastEvaluation = null
        this.lastRoll = null
        this._advanceTurn(isDoubles)
        return
      }
      this.board.setOwner(row, col, null)
      this._emit('piece-captured', { row, col, by: player })
    } else {
      // PLACE (or expanded area placement)
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
    this._advanceTurn(isDoubles)
  }

  resetGame() {
    this.state = GameState.IDLE
    this.board = null
    this.players = []
    this.currentPlayerIndex = 0
    this.lastRoll = null
    this.lastEvaluation = null
    this.gameMode = GameMode.CLASSIC
    this.deck = []
    this.activeCard = null
    this.pendingCardId = null
  }

  // ── Getters ─────────────────────────────────────────────────────────────────

  get snapshot() {
    return {
      state: this.state,
      board: this.board,
      players: this.players,
      currentPlayer: this._currentPlayer(),
      lastRoll: this.lastRoll,
      lastEvaluation: this.lastEvaluation,
      gameMode: this.gameMode,
      deck: this.deck,
      activeCard: this.activeCard,
      pendingCardId: this.pendingCardId
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _removePendingCard() {
    if (!this.pendingCardId) return
    const player = this._currentPlayer()
    const idx = player.hand.findIndex(c => c.cardId === this.pendingCardId)
    if (idx !== -1) player.hand.splice(idx, 1)
    this.pendingCardId = null
  }

  _currentPlayer() {
    return this.players[this.currentPlayerIndex]
  }

  _transition(newState) {
    this.state = newState
  }

  confirmSkipTurn() {
    if (this.state !== GameState.SKIP_TURN_PHASE) return
    const player = this._currentPlayer()
    player.skipTurnCount--
    this._emit('turn-skipped', { player })
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    this._enterCardPhase()
  }

  useCleanseInSkipPhase() {
    if (this.state !== GameState.SKIP_TURN_PHASE) return
    const player = this._currentPlayer()
    const idx = player.hand.findIndex(c => c.cardId === CardId.CLEANSE)
    if (idx === -1) return
    const card = player.hand.splice(idx, 1)[0]
    this._emit('card-used', { card, player })
    this._cardEngine.applyCardSideEffect(card, {}, {
      board: this.board,
      players: this.players,
      currentPlayer: player
    })
    if (player.skipTurnCount === 0) {
      this._transition(GameState.CARD_PHASE)
    } else {
      this._transition(GameState.SKIP_TURN_PHASE)
    }
  }

  _enterCardPhase() {
    const player = this._currentPlayer()
    if (player.skipTurnCount > 0) {
      this._transition(GameState.SKIP_TURN_PHASE)
      return
    }
    this._transition(GameState.CARD_PHASE)
  }

  _advanceTurn(isExtraTurn) {
    if (isExtraTurn) {
      this._emit('extra-turn', { player: this._currentPlayer() })
    } else {
      const player = this._currentPlayer()
      if (player.extraTurnCount > 0) {
        player.extraTurnCount--
        this._emit('extra-turn', { player })
        if (this.gameMode === GameMode.ADVANCED) {
          this._enterCardPhase()
        } else {
          this._transition(GameState.ROLLING)
        }
        return
      }
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    }

    if (this.gameMode === GameMode.ADVANCED) {
      this._enterCardPhase()
    } else {
      this._transition(GameState.ROLLING)
    }
  }

  _emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }
}
