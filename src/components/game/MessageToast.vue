<template>
  <Transition name="toast">
    <div v-if="messageStore.messageKey" class="message-toast">
      {{ t(messageStore.messageKey) }}
    </div>
  </Transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useMessageStore } from '@/stores/messageStore.js'

const { t } = useI18n()
const messageStore = useMessageStore()
</script>

<style scoped>
.message-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #2c2a4a;
  color: #fffdf5;
  padding: 10px 20px 8px;
  border: 3px solid #fffdf5;
  box-shadow: 3px 3px 0 #2c2a4a, 0 0 0 3px #2c2a4a;
  font-family: 'VT323', monospace;
  font-size: 22px;
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
