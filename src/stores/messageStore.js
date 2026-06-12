import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const messageKey = ref(null)
  const messageType = ref(null)

  let dismissTimer = null

  function showMessage(key, type = 'error') {
    clearTimeout(dismissTimer)
    messageKey.value = key
    messageType.value = type
    dismissTimer = setTimeout(() => clearMessage(), 2500)
  }

  function clearMessage() {
    messageKey.value = null
    messageType.value = null
  }

  return { messageKey, messageType, showMessage, clearMessage }
})
