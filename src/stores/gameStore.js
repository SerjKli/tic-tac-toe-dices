import { defineStore } from 'pinia'
import { computed, inject, ref } from 'vue'
import { LocalGameService } from '../services/LocalGameService.js'
import { gameServiceKey } from '../services/serviceKeys.js'
import { GameState, GameMode, TurnAction } from '../core/constants.js'

export const useGameStore = defineStore('game', () => {
  const service = inject(gameServiceKey, () => new LocalGameService(), true)
  const state = service.state

  // UI-only state for card board-targeting (Shield card)
  const boardTargetCardId = ref(null)

  // ── Derived ──────────────────────────────────────────────────────────────────

  const isRolling = computed(() => state.gameState === GameState.ROLLING)
  const isChoosing = computed(() => state.gameState === GameState.CHOOSING)
  const isOver = computed(() => state.gameState === GameState.GAME_OVER)
  const isCardPhase = computed(() => state.gameState === GameState.CARD_PHASE)
  const canSkip = computed(() => isChoosing.value && !!state.lastEvaluation?.mustSkip)
  const isOnline = computed(() => !!service.isOnline)
  const myTurn = computed(() => service.isOnline ? service.isMyTurn : true)
  const isAdvanced = computed(() => state.gameMode === GameMode.ADVANCED)

  const currentTurnAction = computed(() => {
    switch (state.gameState) {
      case GameState.CARD_PHASE: return TurnAction.SELECT_CARD
      case GameState.ROLLING:    return TurnAction.ROLL_DICE
      case GameState.CHOOSING:   return TurnAction.SELECT_CELL
      default:                   return null
    }
  })

  const candidateCells = computed(() => {
    if (!state.lastEvaluation) return []
    return state.lastEvaluation.candidates.filter(c => c.action !== 'BLOCKED')
  })

  const allCandidates = computed(() => state.lastEvaluation?.candidates ?? [])

  const myPlayerId = computed(() =>
    service.isOnline ? service._playerId : state.currentPlayer?.id ?? null
  )

  const myHand = computed(() => {
    if (!isAdvanced.value) return []
    const id = myPlayerId.value
    if (!id) return []
    const player = state.players?.find(p => p.id === id)
    return player?.hand ?? []
  })

  const deckSize = computed(() => state.deck?.length ?? 0)

  const activeCard = computed(() => state.activeCard)

  function isCandidateCell(row, col) {
    if (boardTargetCardId.value === 'SHIELD') {
      const cell = state.board?.getCell(row, col)
      return cell?.ownerId === state.currentPlayer?.id
    }
    return candidateCells.value.some(c => c.row === row && c.col === col)
  }

  function getCandidateAction(row, col) {
    if (boardTargetCardId.value === 'SHIELD') {
      const cell = state.board?.getCell(row, col)
      return cell?.ownerId === state.currentPlayer?.id ? 'PLACE' : null
    }
    return state.lastEvaluation?.candidates.find(c => c.row === row && c.col === col)?.action ?? null
  }

  function getCellShieldCount(row, col) {
    return state.board?.getCell(row, col)?.shieldCount ?? 0
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  function startGame(players, gameMode = GameMode.CLASSIC) {
    service.startGame({ players, gameMode })
  }

  function rollDice() {
    service.rollDice()
  }

  function makeMove({ row, col }) {
    service.makeMove({ row, col })
  }

  function skipTurn() {
    service.skipTurn()
  }

  function drawCard() {
    service.drawCard()
  }

  function useCard(cardId, context = {}) {
    service.useCard(cardId, context)
    boardTargetCardId.value = null
  }

  function setBoardTarget(cardId) {
    boardTargetCardId.value = cardId
  }

  function clearBoardTarget() {
    boardTargetCardId.value = null
  }

  function skipCardInteraction() {
    service.skipCardInteraction()
  }

  function resetGame() {
    service.resetGame()
  }

  function subscribeOnline() {
    if (service.isOnline) service.subscribeToGameState()
  }

  return {
    state,
    isRolling,
    isChoosing,
    isOver,
    isCardPhase,
    canSkip,
    isOnline,
    myTurn,
    isAdvanced,
    currentTurnAction,
    candidateCells,
    allCandidates,
    myHand,
    deckSize,
    activeCard,
    myPlayerId,
    boardTargetCardId,
    isCandidateCell,
    getCandidateAction,
    getCellShieldCount,
    startGame,
    rollDice,
    makeMove,
    skipTurn,
    drawCard,
    useCard,
    skipCardInteraction,
    setBoardTarget,
    clearBoardTarget,
    resetGame,
    subscribeOnline
  }
})
