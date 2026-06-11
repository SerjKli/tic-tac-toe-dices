<template>
  <Transition name="overlay">
    <div v-if="visible" class="board-action-overlay">
      <div class="overlay-panel">
        <!-- Roll dice phase -->
        <template v-if="game.isRolling">
          <p class="overlay-label">{{ t('game.rollDice') }}</p>
          <button class="overlay-btn roll-btn" @click="handleRoll">
            <span class="btn-icon">🎲</span>
            <span class="btn-text">{{ t('game.rollDice') }}</span>
          </button>
        </template>

        <!-- Card phase -->
        <template v-else-if="game.isCardPhase && game.isAdvanced">
          <p class="overlay-label">{{ t('cards.phaseLabel') }}</p>
          <button
            class="overlay-btn draw-btn"
            :disabled="drawDisabled"
            @click="game.drawCard()"
          >
            <span class="btn-text">{{ drawLabel }}</span>
            <span v-if="game.deckSize > 0 && !drawDisabled" class="deck-badge">{{ game.deckSize }}</span>
          </button>
          <button class="overlay-btn skip-btn" @click="game.skipCardInteraction()">
            {{ t('cards.skip') }}
          </button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { useDiceRoll } from '@/composables/useDiceRoll.js'
import { MAX_HAND_SIZE } from '@/core/constants.js'

const { t } = useI18n()
const game = useGameStore()
const { startRoll } = useDiceRoll()

const visible = computed(() =>
  !game.isOver &&
  (game.myTurn || !game.isOnline) &&
  !game.boardTargetCardId &&
  (game.isRolling || (game.isCardPhase && game.isAdvanced))
)

const drawDisabled = computed(() =>
  game.deckSize === 0 || game.myHand.length >= MAX_HAND_SIZE
)

const drawLabel = computed(() => {
  if (game.deckSize === 0) return t('cards.deckEmpty')
  if (game.myHand.length >= MAX_HAND_SIZE) return t('cards.handFull')
  return t('cards.draw')
})

function handleRoll() {
  startRoll(() => game.rollDice())
}
</script>

<style scoped>


.overlay-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  min-width: 180px;
}

.overlay-label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #888;
}

.overlay-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
}

.overlay-btn:active {
  transform: scale(0.97);
}

.overlay-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.roll-btn {
  background: #3498db;
  color: #fff;
  font-size: 1.05rem;
}

.roll-btn:not(:disabled):hover {
  background: #2980b9;
}

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
