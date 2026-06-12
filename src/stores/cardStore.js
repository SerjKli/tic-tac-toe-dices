import { defineStore } from 'pinia'
import { computed, inject, ref, watch } from 'vue'
import { LocalGameService } from '../services/LocalGameService.js'
import { gameServiceKey } from '../services/serviceKeys.js'
import { GameMode, GameState } from '../core/constants.js'

export const useCardStore = defineStore('card', () => {
  const service = inject(gameServiceKey, () => new LocalGameService(), true)
  const state = service.state

  // ── Refs ─────────────────────────────────────────────────────────────────────

  const boardTargetCardId = ref(null)
  const selectedCardId = ref(null)
  const cardErrorKey = ref(null)

  // ── Derived ───────────────────────────────────────────────────────────────────

  const myPlayerId = computed(() =>
    service.isOnline ? service._playerId : state.currentPlayer?.id ?? null
  )

  const isAdvanced = computed(() => state.gameMode === GameMode.ADVANCED)
  const isCardPhase = computed(() => state.gameState === GameState.CARD_PHASE)

  const myHand = computed(() => {
    if (!isAdvanced.value) return []
    const id = myPlayerId.value
    if (!id) return []
    return state.players?.find(p => p.id === id)?.hand ?? []
  })

  const deckSize = computed(() => state.deck?.length ?? 0)

  const activeCard = computed(() => state.activeCard)
  const pendingCardId = computed(() => state.pendingCardId ?? null)

  const canInteractWithCards = computed(() => deckSize.value > 0 || myHand.value.length > 0)

  watch(isCardPhase, (active) => {
    if (!active) selectedCardId.value = null
  })

  // ── Actions ───────────────────────────────────────────────────────────────────

  function selectCard(cardId) {
    const reasonKey = service.hasReasonNotSelectCard(cardId)
    if (reasonKey) {
      cardErrorKey.value = reasonKey
      return
    }
    selectedCardId.value = selectedCardId.value === cardId ? null : cardId
  }

  function clearCardError() {
    cardErrorKey.value = null
  }

  function clearSelectedCard() {
    selectedCardId.value = null
  }

  function drawCard() {
    service.drawCard()
  }

  function useCard(cardId, context = {}) {
    service.useCard(cardId, context)
    boardTargetCardId.value = null
    selectedCardId.value = null
  }

  function setBoardTarget(cardId) {
    boardTargetCardId.value = cardId
  }

  function clearBoardTarget() {
    boardTargetCardId.value = null
  }

  function skipCardInteraction() {
    service.skipCardInteraction()
    selectedCardId.value = null
  }

  return {
    boardTargetCardId,
    selectedCardId,
    cardErrorKey,
    isAdvanced,
    isCardPhase,
    myHand,
    deckSize,
    canInteractWithCards,
    activeCard,
    pendingCardId,
    selectCard,
    clearSelectedCard,
    clearCardError,
    drawCard,
    useCard,
    setBoardTarget,
    clearBoardTarget,
    skipCardInteraction,
  }
})
