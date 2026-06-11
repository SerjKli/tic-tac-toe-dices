import { defineStore } from 'pinia'
import { computed, inject, ref } from 'vue'
import { LocalGameService } from '../services/LocalGameService.js'
import { gameServiceKey } from '../services/serviceKeys.js'
import { GameMode } from '../core/constants.js'

export const useCardStore = defineStore('card', () => {
  const service = inject(gameServiceKey, () => new LocalGameService(), true)
  const state = service.state

  const boardTargetCardId = ref(null)

  const myPlayerId = computed(() =>
    service.isOnline ? service._playerId : state.currentPlayer?.id ?? null
  )

  const isAdvanced = computed(() => state.gameMode === GameMode.ADVANCED)

  const myHand = computed(() => {
    if (!isAdvanced.value) return []
    const id = myPlayerId.value
    if (!id) return []
    return state.players?.find(p => p.id === id)?.hand ?? []
  })

  const deckSize = computed(() => state.deck?.length ?? 0)

  const activeCard = computed(() => state.activeCard)

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

  return {
    boardTargetCardId,
    isAdvanced,
    myHand,
    deckSize,
    activeCard,
    drawCard,
    useCard,
    setBoardTarget,
    clearBoardTarget,
    skipCardInteraction,
  }
})
