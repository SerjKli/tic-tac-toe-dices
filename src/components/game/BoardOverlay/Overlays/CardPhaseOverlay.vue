<template>
  <div class="overlay-panel card-phase-panel">
    <div class="actions">
      <button
          class="overlay-btn draw-btn"
          :disabled="drawDisabled"
          @click="card.drawCard()"
      >
        <span class="btn-text">{{ drawLabel }}</span>
      </button>

      <p class="text-center" v-if="haveCards && !isSkipTurn">
        {{ t('cards.useCardHint') }}
      </p>
    </div>

    <div v-if="isSkipTurn" class="target-section">
      <p class="target-hint">{{ t('cards.selectTarget') }}</p>
      <PlayerStrip
          v-for="p in otherPlayers"
          :players="[p]"
          :style="{ borderColor: p.color }"
          @click="confirmUseCard(p.id)"
          class="player-target-btn"
      />
    </div>

    <button class="overlay-btn cancel-btn" @click="$emit('cancel-select')" v-if="isSkipTurn">
      {{ t('cards.cancel') }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { useCardStore } from '@/stores/cardStore.js'
import { MAX_HAND_SIZE } from '@/core/constants.js'
import PlayerStrip from "@/components/game/PlayerStrip.vue";

const { t } = useI18n()
const game = useGameStore()
const card = useCardStore()

const props = defineProps({
  selectedCardId: { type: String, default: null }
})

const emit = defineEmits(['cancel-select'])

const drawDisabled = computed(() =>
  card.deckSize === 0 || card.myHand.length >= MAX_HAND_SIZE
)

const drawLabel = computed(() => {
  if (card.deckSize === 0) return t('cards.deckEmpty')
  if (card.myHand.length >= MAX_HAND_SIZE) return t('cards.handFull')
  return t('cards.draw')
})

const haveCards = computed(() => card.myHand.length > 0)

const isSkipTurn = computed(() => props.selectedCardId === 'SKIP_TURN')

const otherPlayers = computed(() =>
  game.state.players?.filter(p => p.id !== game.myPlayerId) ?? []
)

function confirmUseCard(targetPlayerId) {
  card.useCard(props.selectedCardId, { targetPlayerId })
  emit('cancel-select')
}
</script>
