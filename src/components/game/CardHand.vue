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
.card-hand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hand-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #999;
}

.not-your-turn-hint {
  margin: 0;
  font-size: 0.78rem;
  color: #bbb;
  font-style: italic;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-hand {
  margin: 0;
  font-size: 0.85rem;
  color: #bbb;
  font-style: italic;
}
</style>
