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
  background: #2d2d2d;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
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
