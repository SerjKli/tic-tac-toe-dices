<template>
  <div class="win-overlay">
    <div class="win-card" :style="{ '--winner-color': winner.color }">
      <div class="win-mark">{{ winner.mark }}</div>
      <h2>{{ t('game.wins', { name: winner.name }) }}</h2>
      <button class="play-again-btn" @click="$emit('play-again')">{{ t('game.playAgain') }}</button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  winner: { type: Object, required: true }
})

defineEmits(['play-again'])

const { t } = useI18n()
</script>

<style scoped>
.win-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.win-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 56px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  border-top: 6px solid var(--winner-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.win-mark {
  font-size: 4rem;
  line-height: 1;
}

h2 {
  margin: 0;
  font-size: 2rem;
  color: var(--winner-color);
}

.play-again-btn {
  margin-top: 8px;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 700;
  background: var(--winner-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.play-again-btn:hover {
  opacity: 0.85;
}
</style>
