<template>
  <div class="card-phase-panel">
    <p class="phase-label">{{ t('cards.phaseLabel') }}</p>

    <div v-if="!showHand" class="actions">
      <button class="card-btn draw-btn" :disabled="deckSize === 0 || myHand.length >= MAX_HAND_SIZE" @click="handleDraw">
        {{ deckSize === 0 ? t('cards.deckEmpty') : myHand.length >= MAX_HAND_SIZE ? t('cards.handFull') : t('cards.draw') }}
        <span v-if="deckSize > 0" class="deck-count">{{ deckSize }}</span>
      </button>
      <button class="card-btn hand-btn" :disabled="myHand.length === 0" @click="showHand = true">
        {{ t('cards.useCard') }} ({{ myHand.length }})
      </button>
      <button class="card-btn skip-btn" @click="handleSkip">{{ t('cards.skip') }}</button>
    </div>

    <div v-else class="hand-view">
      <p class="select-hint">{{ selectHint }}</p>
      <CardHand
        :cards="myHand"
        :selectedCardId="selectedCardId"
        @select="handleCardSelect"
      />

      <template v-if="selectedCardId && needsTarget">
        <p class="target-hint">{{ t('cards.selectTarget') }}</p>
        <div v-if="isSkipTurn" class="player-targets">
          <button
            v-for="p in otherPlayers"
            :key="p.id"
            class="player-target-btn"
            :style="{ borderColor: p.color }"
            @click="confirmUseCard({ targetPlayerId: p.id })"
          >{{ p.name }}</button>
        </div>
      </template>

      <template v-else-if="selectedCardId && isShield">
        <p class="target-hint">{{ t('cards.shieldClickCell') }}</p>
        <button class="card-btn confirm-btn" @click="activateShieldTarget">{{ t('cards.selectOnBoard') }}</button>
      </template>

      <template v-else-if="selectedCardId && !needsTarget">
        <button class="card-btn confirm-btn" @click="confirmUseCard({})">{{ t('cards.confirm') }}</button>
      </template>

      <button class="card-btn back-btn" @click="cancelHand">{{ t('cards.back') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { CARDS } from '@/core/cards.js'
import { MAX_HAND_SIZE } from '@/core/constants.js'
import CardHand from './CardHand.vue'

const { t } = useI18n()
const game = useGameStore()

const myHand = computed(() => game.myHand)
const deckSize = computed(() => game.deckSize)
const showHand = ref(false)
const selectedCardId = ref(null)

const selectedDef = computed(() => selectedCardId.value ? CARDS[selectedCardId.value] : null)

const isShield = computed(() => selectedDef.value?.id === 'SHIELD')
const isSkipTurn = computed(() => selectedDef.value?.id === 'SKIP_TURN')

const needsTarget = computed(() => isSkipTurn.value)

const otherPlayers = computed(() =>
  game.state.players?.filter(p => p.id !== game.myPlayerId) ?? []
)

const selectHint = computed(() => selectedCardId.value ? t('cards.cardSelected') : t('cards.selectCard'))

function handleDraw() {
  game.drawCard()
}

function handleSkip() {
  game.skipCardInteraction()
}

function handleCardSelect(cardId) {
  selectedCardId.value = selectedCardId.value === cardId ? null : cardId
}

function confirmUseCard(context) {
  if (!selectedCardId.value) return
  game.useCard(selectedCardId.value, context)
  cancelHand()
}

function activateShieldTarget() {
  game.setBoardTarget(selectedCardId.value)
  cancelHand()
}

function cancelHand() {
  showHand.value = false
  selectedCardId.value = null
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

.hand-btn {
  background: #fff;
  color: #7c5cbf;
  border: 2px solid #7c5cbf;
}

.hand-btn:not(:disabled):hover { background: #f0eaff; }

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

.hand-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.select-hint, .target-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #7c5cbf;
}

.confirm-btn {
  background: #27ae60;
  color: #fff;
}

.confirm-btn:hover { background: #229954; }

.back-btn {
  background: #eee;
  color: #666;
}

.back-btn:hover { background: #ddd; }

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
