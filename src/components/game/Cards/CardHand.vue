<template>
  <div class="card-hand" :class="{ disabled }">
    <p v-if="showTitle" class="hand-title">{{ t('cards.handTitle') }}</p>
    <p v-if="lockMessage" class="not-your-turn-hint">{{ lockMessage }}</p>

    <div v-if="cardStore.myHand.length > 0" class="cards-list">
      <CardItem
        v-for="group in groupedHand"
        :key="group.cardId"
        :card="cardDef(group)"
        :card-amount="group.amount"
        :selected="cardStore.selectedCardId === group.cardId"
        :pending="cardStore.pendingCardId === group.cardId"
        :disabled="disabled"
        @select="cardStore.selectCard($event)"
      />
    </div>
    <p v-else class="empty-hand">{{ t('cards.emptyHand') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCardStore } from '@/stores/cardStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { CARDS } from '@/core/cards.js'
import CardItem from './CardItem.vue'

const { t } = useI18n()
const cardStore = useCardStore()
const game = useGameStore()

defineProps({
  showTitle: { type: Boolean, default: true }
})

const groupedHand = computed(() => {
  const groups = {}
  for (const card of cardStore.myHand) {
    if (!groups[card.cardId]) {
      groups[card.cardId] = { ...card, amount: 0 }
    }
    groups[card.cardId].amount++
  }
  return Object.values(groups)
})

const disabled = computed(() =>
  !cardStore.isCardPhase || (game.isOnline && !game.myTurn)
)

const lockMessage = computed(() => {
  if (!cardStore.isCardPhase) return null
  if (game.isOnline && !game.myTurn) return t('cards.notYourTurn')
  return null
})

function cardDef(card) {
  return CARDS[card.cardId] ?? {
    id: card.cardId,
    nameKey: card.cardId,
    descKey: card.cardId,
    color: '#999',
    type: 'OFFENSIVE'
  }
}
</script>

<style scoped>

</style>
