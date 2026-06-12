<template>
  <div class="card-phase-panel">
    <p class="phase-label">{{ t('cards.phaseLabel') }}</p>

    <div class="actions">
      <button class="overlay-btn draw-btn" :disabled="card.deckSize === 0 || card.myHand.length >= MAX_HAND_SIZE" @click="handleDraw">
        {{ card.deckSize === 0 ? t('cards.deckEmpty') : card.myHand.length >= MAX_HAND_SIZE ? t('cards.handFull') : t('cards.draw') }}
        <span v-if="card.deckSize > 0" class="deck-count">{{ card.deckSize }}</span>
      </button>
      <button class="overlay-btn skip-btn" @click="handleSkip">{{ t('cards.skip') }}</button>
    </div>

    <div v-if="card.selectedCardId && selectedDef" class="confirm-section">
      <p class="confirm-label">
        {{ t('cards.useCardConfirm', { name: t(selectedDef.nameKey) }) }}
      </p>

      <template v-if="isSkipTurn">
        <p class="target-hint">{{ t('cards.selectTarget') }}</p>

        <PlayerStrip
            v-if="game.state.players?.length"
            :players="otherPlayers"
        />
      </template>

      <template v-else-if="isShield">
        <p class="target-hint">{{ t('cards.shieldClickCell') }}</p>
        <button class="overlay-btn confirm-btn" @click="activateShieldTarget">{{ t('cards.selectOnBoard') }}</button>
      </template>

      <template v-else>
        <button class="overlay-btn confirm-btn" @click="confirmUseCard({})">{{ t('cards.confirm') }}</button>
      </template>

      <button class="overlay-btn cancel-btn" @click="card.clearSelectedCard()">{{ t('cards.cancel') }}</button>
    </div>


  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { useCardStore } from '@/stores/cardStore.js'
import { CARDS } from '@/core/cards.js'
import {CardId, MAX_HAND_SIZE} from '@/core/constants.js'
import PlayerStrip from "@/components/game/Player/PlayerStrip.vue";

const { t } = useI18n()
const game = useGameStore()
const card = useCardStore()

const selectedDef = computed(() => card.selectedCardId ? CARDS[card.selectedCardId] : null)
const isShield = computed(() => selectedDef.value?.id === CardId.SHIELD)
const isSkipTurn = computed(() => selectedDef.value?.id === CardId.SKIP_TURN)

const otherPlayers = computed(() =>
  game.state.players?.filter(p => p.id !== game.myPlayerId) ?? []
)

function handleDraw() {
  card.drawCard()
}

function handleSkip() {
  card.skipCardInteraction()
}

function confirmUseCard(context) {
  card.useCard(card.selectedCardId, context)
}

function activateShieldTarget() {
  card.setBoardTarget(card.selectedCardId)
  card.clearSelectedCard()
}
</script>

<style scoped>

</style>
