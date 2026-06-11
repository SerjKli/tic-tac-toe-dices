<template>
  <Transition name="overlay">
    <div v-if="visible" class="board-action-overlay">
      <RollDiceOverlay v-if="game.isRolling || showingResult" />
      <CardPhaseOverlay v-else-if="game.isCardPhase && game.isAdvanced" :selectedCardId="selectedCardId" @cancel-select="$emit('cancel-select')" />
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { useDiceRoll } from '@/composables/useDiceRoll.js'
import RollDiceOverlay from './Overlays/RollDiceOverlay.vue'
import CardPhaseOverlay from './Overlays/CardPhaseOverlay.vue'

defineProps({
  selectedCardId: { type: String, default: null }
})

defineEmits(['cancel-select'])

const game = useGameStore()
const { showingResult } = useDiceRoll()

const visible = computed(() =>
  !game.isOver &&
  (game.myTurn || !game.isOnline) &&
  !game.boardTargetCardId &&
  (game.isRolling || showingResult.value || (game.isCardPhase && game.isAdvanced))
)
</script>

<style scoped>

.btn-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.draw-btn {
  background: #7c5cbf;
  color: #fff;
  position: relative;
}

.draw-btn:not(:disabled):hover {
  background: #6a4ca8;
}

.deck-badge {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 0.8rem;
}

.skip-btn {
  background: #eee;
  color: #666;
}

.skip-btn:hover {
  background: #ddd;
}

/* Transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
