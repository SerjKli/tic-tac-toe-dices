<template>
  <div class="win-overlay">
    <div class="win-card px-card" :style="{ '--winner-color': winner.color }">
      <div class="win-header px-header" :style="{ background: winner.color }">
        <div class="win-mark px-mark-tile">{{ winner.mark }}</div>
        <h2 class="win-title">{{ t('game.wins', { name: winner.name }) }}</h2>
      </div>
      <div class="px-body win-body">
        <button class="play-again-btn px-btn px-btn--green" @click="$emit('play-again')">▶ {{ t('game.playAgain') }}</button>
      </div>
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
  background: rgba(44, 42, 74, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.win-card {
  min-width: 280px;
  text-align: center;
}

.win-header {
  justify-content: center;
  gap: 14px;
}

.win-mark {
  font-size: 2rem;
}

.win-title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #fffdf5;
  text-shadow: 2px 2px 0 #2c2a4a;
  line-height: 1.6;
}

.win-body {
  display: flex;
  justify-content: center;
}

.play-again-btn {
  font-size: 14px;
}
</style>
