<template>
  <div class="card-phase-panel">
    <p class="phase-label">{{ t('cards.phaseLabel') }}</p>

    <div class="actions">
      <button class="card-btn draw-btn" :disabled="deckSize === 0 || myHand.length >= MAX_HAND_SIZE" @click="handleDraw">
        {{ deckSize === 0 ? t('cards.deckEmpty') : myHand.length >= MAX_HAND_SIZE ? t('cards.handFull') : t('cards.draw') }}
        <span v-if="deckSize > 0" class="deck-count">{{ deckSize }}</span>
      </button>
      <button class="card-btn skip-btn" @click="handleSkip">{{ t('cards.skip') }}</button>
    </div>

    <div v-if="selectedCardId && selectedDef" class="confirm-section">
      <p class="confirm-label">
        {{ t('cards.useCardConfirm', { name: t(selectedDef.nameKey) }) }}
      </p>

      <template v-if="isSkipTurn">
        <p class="target-hint">{{ t('cards.selectTarget') }}</p>
        <div class="player-targets">
          <button
            v-for="p in otherPlayers"
            :key="p.id"
            class="player-target-btn"
            :style="{ borderColor: p.color }"
            @click="confirmUseCard({ targetPlayerId: p.id })"
          >{{ p.name }}</button>
        </div>
      </template>

      <template v-else-if="isShield">
        <p class="target-hint">{{ t('cards.shieldClickCell') }}</p>
        <button class="card-btn confirm-btn" @click="activateShieldTarget">{{ t('cards.selectOnBoard') }}</button>
      </template>

      <template v-else>
        <button class="card-btn confirm-btn" @click="confirmUseCard({})">{{ t('cards.confirm') }}</button>
      </template>

      <button class="card-btn cancel-btn" @click="$emit('cancel-select')">{{ t('cards.cancel') }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { CARDS } from '@/core/cards.js'
import { MAX_HAND_SIZE } from '@/core/constants.js'

const { t } = useI18n()
const game = useGameStore()

const props = defineProps({
  selectedCardId: { type: String, default: null }
})

const emit = defineEmits(['cancel-select'])

const myHand = computed(() => game.myHand)
const deckSize = computed(() => game.deckSize)

const selectedDef = computed(() => props.selectedCardId ? CARDS[props.selectedCardId] : null)
const isShield = computed(() => selectedDef.value?.id === 'SHIELD')
const isSkipTurn = computed(() => selectedDef.value?.id === 'SKIP_TURN')

const otherPlayers = computed(() =>
  game.state.players?.filter(p => p.id !== game.myPlayerId) ?? []
)

function handleDraw() {
  game.drawCard()
}

function handleSkip() {
  game.skipCardInteraction()
}

function confirmUseCard(context) {
  game.useCard(props.selectedCardId, context)
  emit('cancel-select')
}

function activateShieldTarget() {
  game.setBoardTarget(props.selectedCardId)
  emit('cancel-select')
}
</script>

<style scoped>
.card-phase-panel {
  background: #f8f4ff;
  border: 2px solid #7c5cbf;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 220px;
}

.phase-label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #7c5cbf;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.card-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.draw-btn {
  background: #7c5cbf;
  color: #fff;
}

.draw-btn:not(:disabled):hover { background: #6a4ca8; }

.skip-btn {
  background: #eee;
  color: #666;
}

.skip-btn:hover { background: #ddd; }

.deck-count {
  background: #fff;
  color: #7c5cbf;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 0.8rem;
}

.confirm-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #e0d5f5;
  padding-top: 12px;
}

.confirm-label {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a3080;
}

.target-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #7c5cbf;
}

.confirm-btn {
  background: #27ae60;
  color: #fff;
}

.confirm-btn:hover { background: #229954; }

.cancel-btn {
  background: transparent;
  color: #999;
  border: 1px solid #ddd;
  font-size: 0.85rem;
  padding: 7px 14px;
}

.cancel-btn:hover { background: #f5f5f5; color: #666; }

.player-targets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.player-target-btn {
  padding: 6px 12px;
  border: 2px solid;
  border-radius: 8px;
  background: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.player-target-btn:hover { background: #f5f5f5; }
</style>
