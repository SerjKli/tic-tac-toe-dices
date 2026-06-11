<template>
  <div class="card-hand">
    <button
      v-for="card in cards"
      :key="card.instanceId"
      class="card-chip"
      :class="{ selected: selectedCardId === card.cardId }"
      :style="{ '--card-color': cardDef(card).color }"
      @click="$emit('select', card.cardId)"
    >
      <span class="card-name">{{ t(cardDef(card).nameKey) }}</span>
    </button>
    <p v-if="cards.length === 0" class="empty-hand">{{ t('cards.emptyHand') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { CARDS } from '@/core/cards.js'

const { t } = useI18n()

defineProps({
  cards: { type: Array, default: () => [] },
  selectedCardId: { type: String, default: null }
})

defineEmits(['select'])

function cardDef(card) {
  return CARDS[card.cardId] ?? { color: '#999', nameKey: card.cardId }
}
</script>

<style scoped>
.card-hand {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-chip {
  padding: 6px 12px;
  border-radius: 20px;
  border: 2px solid var(--card-color);
  background: #fff;
  color: var(--card-color);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.card-chip.selected {
  background: var(--card-color);
  color: #fff;
}

.card-chip:hover:not(.selected) {
  background: color-mix(in srgb, var(--card-color) 10%, white);
}

.empty-hand {
  margin: 0;
  font-size: 0.85rem;
  color: #aaa;
  font-style: italic;
}
</style>
