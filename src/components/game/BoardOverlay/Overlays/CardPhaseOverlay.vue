<template>
  <div class="overlay-panel card-phase-panel">
    <p class="overlay-label">{{ t('cards.phaseLabel') }}</p>
    <div class="actions">
      <button
          class="card-btn draw-btn"
          :disabled="drawDisabled"
          @click="game.drawCard()"
      >
        <span class="btn-text">{{ drawLabel }}</span>
        <span v-if="game.deckSize > 0 && !drawDisabled" class="deck-count">{{ game.deckSize }}</span>
      </button>

      <p class="text-center">
        Или вы можете использовать<br/>имеющуюся карту
      </p>
    </div>

<!--    <button class="overlay-btn skip-btn" @click="game.skipCardInteraction()">-->
<!--      {{ t('cards.skip') }}-->
<!--    </button>-->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { MAX_HAND_SIZE } from '@/core/constants.js'

const { t } = useI18n()
const game = useGameStore()

const drawDisabled = computed(() =>
  game.deckSize === 0 || game.myHand.length >= MAX_HAND_SIZE
)

const drawLabel = computed(() => {
  if (game.deckSize === 0) return t('cards.deckEmpty')
  if (game.myHand.length >= MAX_HAND_SIZE) return t('cards.handFull')
  return t('cards.draw')
})
</script>
