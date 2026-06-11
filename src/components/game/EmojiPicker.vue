<template>
  <div class="floating-button-wrapper" id="emoji-button-wrapper">
    <div v-if="open" class="emoji-popup">
      <button
        v-for="emoji in DEFAULT_CHAT_EMOJIS"
        :key="emoji"
        class="emoji-btn"
        @click="pick(emoji)"
      >{{ emoji }}</button>
    </div>
    <button class="chat-fab" @click.stop="open = !open" :class="{ active: open }">💭</button>
    <div v-if="open" class="backdrop" @click="open = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DEFAULT_CHAT_EMOJIS } from '@/core/constants.js'

const emit = defineEmits(['send'])

const open = ref(false)

function pick(emoji) {
  emit('send', emoji)
  open.value = false
}
</script>

<style scoped>

</style>
