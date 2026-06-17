import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pushPlayerEmoji, subscribeToPlayerEmojis, unsubscribePlayerEmojis } from '@backend'

const STORAGE_KEY = 'tic-toe:chat-emojis'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const useChatStore = defineStore('chat', () => {
  const playerEmojis = ref(loadFromStorage())
  let _emojisRef = null

  function sendEmoji(playerId, emoji, roomId = null) {
    playerEmojis.value = { ...playerEmojis.value, [playerId]: emoji }
    if (roomId) {
      pushPlayerEmoji(roomId, playerId, emoji)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerEmojis.value))
    }
  }

  function subscribe(roomId) {
    unsubscribe()
    _emojisRef = subscribeToPlayerEmojis(roomId, (data) => {
      playerEmojis.value = data || {}
    })
  }

  function unsubscribe() {
    if (_emojisRef) {
      unsubscribePlayerEmojis(_emojisRef)
      _emojisRef = null
    }
  }

  function reset() {
    unsubscribe()
    playerEmojis.value = {}
    localStorage.removeItem(STORAGE_KEY)
  }

  return { playerEmojis, sendEmoji, subscribe, unsubscribe, reset }
})
