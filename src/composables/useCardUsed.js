import { ref, watch } from 'vue'

const visible = ref(false)
const cardId = ref(null)
const player = ref(null)
const targetPlayerId = ref(null)
let hideTimer = null

export function useCardUsed() {
  function show(newCardId, newPlayer, newTargetPlayerId = null) {
    clearTimeout(hideTimer)
    cardId.value = newCardId
    player.value = newPlayer
    targetPlayerId.value = newTargetPlayerId
    visible.value = true
    hideTimer = setTimeout(() => { visible.value = false }, 1500)
  }

  function hide() {
    clearTimeout(hideTimer)
    visible.value = false
  }

  return { visible, cardId, player, targetPlayerId, show, hide }
}

export function watchForCardUsed(game) {
  const { show } = useCardUsed()
  let lastShownTs = null
  watch(() => game.state.lastUsedCard, (val) => {
    if (!val || !game.isOnline || game.myTurn) return
    if (Date.now() - val.ts > 4000) return
    if (val.ts === lastShownTs) return
    lastShownTs = val.ts
    const p = game.state.players?.find(p => p.id === val.playerId)
    if (p) show(val.cardId, p, val.targetPlayerId ?? null)
  })
}
