<template>
  <button class="exit-btn" @click="handleExit">{{ t('game.exitGame') }}</button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'

const router = useRouter()
const game = useGameStore()
const { t } = useI18n()

function handleExit() {
  game.resetGame()
  router.push('/')
}
</script>

<style scoped>
.exit-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  padding: 8px 14px 6px;
  border: 3px solid #ef4444;
  background: #fffdf5;
  color: #ef4444;
  box-shadow: 2px 2px 0 #ef4444;
  cursor: pointer;
  transition: transform 0.08s, box-shadow 0.08s, background 0.08s, color 0.08s;
}

.exit-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #ef4444;
}

.exit-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #ef4444;
  background: #ef4444;
  color: #fffdf5;
}
</style>
