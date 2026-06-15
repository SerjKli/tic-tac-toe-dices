import { defineStore } from 'pinia'
import { computed, inject, ref } from 'vue'
import { LocalGameService } from '../services/LocalGameService.js'
import { gameServiceKey } from '../services/serviceKeys.js'
import { GameState, GameMode, TurnAction } from '../core/constants.js'
import { useCardStore } from './cardStore.js'

export const useGameStore = defineStore('game', () => {
  const service = inject(gameServiceKey, () => new LocalGameService(), true)
  const state = service.state

  // ── Derived ──────────────────────────────────────────────────────────────────

  const showingBoard = ref(false)

  const isRolling = computed(() => state.gameState === GameState.ROLLING)
  const isChoosing = computed(() => state.gameState === GameState.CHOOSING)
  const isOver = computed(() => state.gameState === GameState.GAME_OVER)
  const isCardPhase = computed(() => state.gameState === GameState.CARD_PHASE)


  const isSkipTurnPhase = computed(() => state.gameState === GameState.SKIP_TURN_PHASE)
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

  function isCandidateCell(row, col) {
    const cardStore = useCardStore()
    if (cardStore.boardTargetCardId === 'SHIELD') {
      const cell = state.board?.getCell(row, col)
      return cell?.ownerId === state.currentPlayer?.id
    }
    return candidateCells.value.some(c => c.row === row && c.col === col)
  }

  function getCandidateAction(row, col) {
    const cardStore = useCardStore()
    if (cardStore.boardTargetCardId === 'SHIELD') {
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

  function confirmSkipTurn() {
    service.confirmSkipTurn()
  }

  function useCleanseInSkipPhase() {
    service.useCleanseInSkipPhase()
  }

  function resetGame() {
    service.resetGame()
  }

  function subscribeOnline() {
    if (service.isOnline) service.subscribeToGameState()
  }

  return {
    state,
    showingBoard,
    isRolling,
    isChoosing,
    isOver,
    isCardPhase,
    isSkipTurnPhase,
    canSkip,
    isOnline,
    myTurn,
    isAdvanced,
    currentTurnAction,
    candidateCells,
    allCandidates,
    myPlayerId,
    isCandidateCell,
    getCandidateAction,
    getCellShieldCount,
    startGame,
    rollDice,
    makeMove,
    skipTurn,
    confirmSkipTurn,
    useCleanseInSkipPhase,
    resetGame,
    subscribeOnline
  }
})
