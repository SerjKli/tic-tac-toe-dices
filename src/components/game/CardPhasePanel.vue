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

</style>
