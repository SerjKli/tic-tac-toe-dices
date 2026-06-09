<template>
  <button class="exit-btn" @click="handleExit">{{ t('game.exitGame') }}</button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../../stores/gameStore.js'

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
  padding: 8px 16px;
  border: 1px solid #d44;
  border-radius: 8px;
  background: transparent;
  color: #d44;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.exit-btn:hover {
  background: #d44;
  color: #fff;
}
</style>
