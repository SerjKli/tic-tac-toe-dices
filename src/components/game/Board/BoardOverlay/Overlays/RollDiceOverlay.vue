<template>
  <div class="overlay-panel">
    <DiceFaces :roll="showingResult ? game.state.lastRoll : null" v-if="isAnimating || showingResult"/>

    <template v-else>
      <button class="overlay-btn roll-btn" @click="handleRoll">
        <span class="btn-icon">🎲</span> &nbsp;
        <span class="btn-text">{{ t('game.rollDice') }}</span>
      </button>
    </template>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { useDiceRoll } from '@/composables/useDiceRoll.js'
import DiceFaces from "@/components/game/Dice/DiceFaces.vue";

const { t } = useI18n()
const game = useGameStore()
const { startRoll, isAnimating, showingResult } = useDiceRoll()

function handleRoll() {
  startRoll(() => game.rollDice())
}
</script>
