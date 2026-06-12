<template>
  <div class="overlay-panel card-phase-panel">
    <div class="actions" v-if="!selectedDef">
      <button
          class="overlay-btn draw-btn"
          :disabled="drawDisabled"
          @click="card.drawCard()"
      >
        <span class="btn-icon">🃏</span> &nbsp;
        <span class="btn-text">{{ drawLabel }}</span>
      </button>

      <p class="text-center" v-if="haveCards && !isSkipTurn && !selectedDef">
        {{ hintTextLabel }}
      </p>
    </div>

    <div v-if="card.selectedCardId && selectedDef" class="confirm-section">
      <p class="confirm-label">
        {{ t('cards.useCardConfirm', { name: t(selectedDef.nameKey) }) }}
      </p>

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

      <template v-else-if="isShield">
        <p class="target-hint">{{ t('cards.shieldClickCell') }}</p>
        <button class="overlay-btn confirm-btn" @click="activateShieldTarget">{{ t('cards.selectOnBoard') }}</button>
      </template>

      <template v-else>
        <button class="overlay-btn confirm-btn" @click="confirmUseCard({})">{{ t('cards.confirm') }}</button>
      </template>
    </div>

    <button class="overlay-btn cancel-btn" @click="card.clearSelectedCard()" v-if="card.selectedCardId">
      {{ t('cards.cancel') }}
    </button>

    <button class="overlay-btn cancel-btn" v-if="!card.canInteractWithCards" @click="card.skipCardInteraction()">
      {{ t('cards.skipPhase') }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { useCardStore } from '@/stores/cardStore.js'
import {CardId, MAX_HAND_SIZE} from '@/core/constants.js'
import PlayerStrip from "@/components/game/Player/PlayerStrip.vue";
import {CARDS} from "@/core/cards.js";

const { t } = useI18n()
const game = useGameStore()
const card = useCardStore()

const drawDisabled = computed(() =>
  card.deckSize === 0 || card.myHand.length >= MAX_HAND_SIZE
)

const drawLabel = computed(() => {
  if (card.deckSize === 0) return t('cards.deckEmpty')
  if (card.myHand.length >= MAX_HAND_SIZE) return t('cards.handFull')
  return t('cards.draw')
})

const hintTextLabel = computed(() => {
  if (card.deckSize === 0) return t('cards.useEmptyDeckCardHint')
  return t('cards.useCardHint')
});

const haveCards = computed(() => card.myHand.length > 0)

const selectedDef = computed(() => card.selectedCardId ? CARDS[card.selectedCardId] : null)
const isSkipTurn = computed(() => card.selectedCardId === CardId.SKIP_TURN)
const isShield = computed(() => selectedDef.value?.id === CardId.SHIELD)

const otherPlayers = computed(() =>
  game.state.players?.filter(p => p.id !== game.myPlayerId) ?? []
)

function confirmUseCard(targetPlayerId) {
  card.useCard(card.selectedCardId, { targetPlayerId })
}

function activateShieldTarget() {
  card.setBoardTarget(card.selectedCardId)
  card.clearSelectedCard()
}
</script>
