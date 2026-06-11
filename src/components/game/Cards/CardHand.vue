<template>
  <div class="card-hand" :class="{ disabled }">
    <p v-if="showTitle" class="hand-title">{{ t('cards.handTitle') }}</p>
    <p v-if="lockMessage" class="not-your-turn-hint">{{ lockMessage }}</p>

    <div v-if="cards.length > 0" class="cards-list">
      <CardItem
        v-for="card in cards"
        :key="card.instanceId"
        :card="cardDef(card)"
        :selected="selectedCardId === card.cardId"
        :disabled="disabled"
        @select="$emit('select', card.cardId)"
      />
    </div>
    <p v-else class="empty-hand">{{ t('cards.emptyHand') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { CARDS } from '@/core/cards.js'
import CardItem from './CardItem.vue'

const { t } = useI18n()

defineProps({
  cards: { type: Array, default: () => [] },
  selectedCardId: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  showTitle: { type: Boolean, default: true },
  lockMessage: { type: String, default: null }
})

defineEmits(['select'])

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
