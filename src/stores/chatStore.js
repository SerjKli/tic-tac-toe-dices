import { defineStore } from 'pinia'
import { ref } from 'vue'
import { off } from 'firebase/database'
import { pushPlayerEmoji, subscribeToPlayerEmojis } from '../firebase/roomService.js'

export const useChatStore = defineStore('chat', () => {
  const playerEmojis = ref({})
  let _emojisRef = null

  function sendEmoji(playerId, emoji, roomId = null) {
    playerEmojis.value = { ...playerEmojis.value, [playerId]: emoji }
    if (roomId) pushPlayerEmoji(roomId, playerId, emoji)
  }

  function subscribe(roomId) {
    unsubscribe()
    _emojisRef = subscribeToPlayerEmojis(roomId, (data) => {
      playerEmojis.value = data || {}
    })
  }

  function unsubscribe() {
    if (_emojisRef) {
      off(_emojisRef)
      _emojisRef = null
    }
  }

  function reset() {
    unsubscribe()
    playerEmojis.value = {}
  }

  return { playerEmojis, sendEmoji, subscribe, unsubscribe, reset }
})
