<template>
  <div
    class="card-item"
    :class="[`type-${card.type.toLowerCase()}`, { selected, disabled }]"
    :style="{ '--card-color': card.color }"
    @click="!disabled && $emit('select', card.id)"
  >
    <svg class="card-geo" aria-hidden="true" viewBox="0 0 120 140" preserveAspectRatio="xMaxYMin slice">
      <template v-if="card.type === 'OFFENSIVE'">
        <polygon points="120,0 120,95 25,0" fill="currentColor" opacity="0.10" />
        <polygon points="120,0 120,48 72,0" fill="currentColor" opacity="0.08" />
      </template>
      <template v-else-if="card.type === 'DEFENSIVE'">
        <circle cx="120" cy="140" r="44" fill="none" stroke="currentColor" stroke-width="14" opacity="0.11" />
        <circle cx="120" cy="140" r="70" fill="none" stroke="currentColor" stroke-width="14" opacity="0.08" />
        <circle cx="120" cy="140" r="96" fill="none" stroke="currentColor" stroke-width="14" opacity="0.05" />
      </template>
      <template v-else>
        <polygon points="105,4 122,21 105,38 88,21" fill="currentColor" opacity="0.12" />
        <polygon points="115,48 128,61 115,74 102,61" fill="currentColor" opacity="0.09" />
        <polygon points="108,88 116,96 108,104 100,96" fill="currentColor" opacity="0.06" />
      </template>
    </svg>

    <span v-if="cardAmount > 1" :key="cardAmount" class="card-amount pop-in">×{{ cardAmount }}</span>

    <div class="card-inner">

      <span class="card-type-badge" v-if="card.type === 'OFFENSIVE'">
        <span class="material-icons" >whatshot</span>
      </span>

      <span class="card-type-badge" v-else-if="card.type === 'DEFENSIVE'">
        <span class="material-icons" >local_hospital</span>
      </span>

      <span class="card-type-badge" v-else>
        <span class="material-icons">control_camera</span>
      </span>

      <div class="card-content">
        <span class="card-name">{{ t(card.nameKey) }}</span>
        <p class="card-caption">{{ t(card.descKey) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { Card } from '@/core/models/Card.js'

const { t } = useI18n()

defineProps({
  card: { type: Card, required: true },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  cardAmount: { type: Number, default: 1 }
})

defineEmits(['select'])
</script>

<style scoped>
.card-item {
  position: relative;
  width: 100%;
  height: 160px;
  background: #fff;
  border: 1.5px solid color-mix(in srgb, var(--card-color) 25%, #e4e4e4);
  border-radius: 10px;
  //overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s, opacity 0.15s;
  text-align: left;
  padding: 0;
}

.card-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--card-color);
  border-radius: 2px 0 0 2px;
  z-index: 2;
}

.card-item:hover:not(.disabled):not(.selected) {
  border-color: var(--card-color);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--card-color) 20%, transparent);
  transform: translateY(-1px);
}

.card-item.selected {
  border-color: var(--card-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--card-color) 28%, transparent);
  background: color-mix(in srgb, var(--card-color) 5%, white);
}

.card-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-amount {
  position: absolute;
  top: -13px;
  right: 8px;
  z-index: 3;
  width: 26px;
  height: 26px;
  padding: 0 4px;
  border-radius: 13px;
  background: var(--card-color);
  color: #fff;
  font-size: 0.8rem;
  text-align: center;
  box-sizing: border-box;
  transform: rotate(-30deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-geo {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  color: var(--card-color);
  pointer-events: none;
}

.card-inner {
  position: relative;
  z-index: 1;
  padding: 10px 10px 10px 14px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-type-badge {
  font-size: 0.2rem;
  color: var(--card-color);
  background: color-mix(in srgb, var(--card-color) 10%, white);
  border: 1px solid color-mix(in srgb, var(--card-color) 25%, transparent);
  border-radius: 10px 0 10px 0;
  padding: 2px 3px;
  align-self: flex-start;
  white-space: nowrap;
  position: absolute;
  bottom: -1px;
  right: -1px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.card-caption {
  margin: 0;
  font-size: 0.7rem;
  color: #888;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
