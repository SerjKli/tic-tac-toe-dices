import { defineStore } from 'pinia'
import { computed, inject } from 'vue'
import { LocalGameService } from '../services/LocalGameService.js'
import { gameServiceKey } from '../services/serviceKeys.js'
import { GameState } from '../core/constants.js'

export const useGameStore = defineStore('game', () => {
  const service = inject(gameServiceKey, () => new LocalGameService(), true)
  const state = service.state

  // ── Derived ──────────────────────────────────────────────────────────────────

  const isRolling = computed(() => state.gameState === GameState.ROLLING)
  const isChoosing = computed(() => state.gameState === GameState.CHOOSING)
  const isOver = computed(() => state.gameState === GameState.GAME_OVER)
  const canSkip = computed(() => isChoosing.value && !!state.lastEvaluation?.mustSkip)
  const isOnline = computed(() => !!service.isOnline)
  const myTurn = computed(() => service.isOnline ? service.isMyTurn : true)

  const candidateCells = computed(() => {
    if (!state.lastEvaluation) return []
    return state.lastEvaluation.candidates.filter(c => c.action !== 'BLOCKED')
  })

  const allCandidates = computed(() => state.lastEvaluation?.candidates ?? [])

  function isCandidateCell(row, col) {
    return candidateCells.value.some(c => c.row === row && c.col === col)
  }

  function getCandidateAction(row, col) {
    return state.lastEvaluation?.candidates.find(c => c.row === row && c.col === col)?.action ?? null
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  function startGame(players) {
    service.startGame({ players })
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
    canSkip,
    isOnline,
    myTurn,
    candidateCells,
    allCandidates,
    isCandidateCell,
    getCandidateAction,
    startGame,
    rollDice,
    makeMove,
    skipTurn,
    resetGame,
    subscribeOnline
  }
})
