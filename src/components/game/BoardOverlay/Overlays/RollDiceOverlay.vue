<template>
  <div class="overlay-panel">
    <DiceFaces :roll="roll" v-if="isAnimating"/>

    <template v-else>
      <p class="overlay-label">{{ t('game.rollDice') }}</p>
      <button class="overlay-btn roll-btn" @click="handleRoll">
        <span class="btn-icon">🎲</span>
        <span class="btn-text">{{ t('game.rollDice') }}</span>
      </button>
    </template>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { useDiceRoll } from '@/composables/useDiceRoll.js'
import DiceFaces from "@/components/game/DiceFaces.vue";

const { t } = useI18n()
const game = useGameStore()
const { startRoll,isAnimating } = useDiceRoll()


function handleRoll() {
  startRoll(() => game.rollDice())
}
</script>
