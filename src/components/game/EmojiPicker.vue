<template>
  <div class="emoji-picker-wrapper">
    <div v-if="open" class="emoji-popup">
      <button
        v-for="emoji in EMOJIS"
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

const emit = defineEmits(['send'])

const EMOJIS = ['😀', '😂', '😍', '😢', '😡', '😮', '👍', '🎉', '🤔', '😴']
const open = ref(false)

function pick(emoji) {
  emit('send', emoji)
  open.value = false
}
</script>

<style scoped>
.emoji-picker-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.chat-fab {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}

.chat-fab:hover, .chat-fab.active {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.emoji-popup {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.emoji-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s, transform 0.1s;
}

.emoji-btn:hover {
  background: #f0f0f0;
  transform: scale(1.2);
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
}
</style>
