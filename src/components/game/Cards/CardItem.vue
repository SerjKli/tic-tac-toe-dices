<template>
  <div
    class="card-item pop-in"
    :class="[`type-${card.type.toLowerCase()}`, { selected, disabled, pending }]"
    :style="{ '--card-color': card.color }"
    @click="!disabled && $emit('select', card.id)"
  >
    <CardGeoOffensive v-if="card.type === 'OFFENSIVE'" />
    <CardGeoDefensive v-else-if="card.type === 'DEFENSIVE'" />
    <CardGeoUtility v-else />

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
import CardGeoOffensive from './CardTypes/CardGeoOffensive.vue'
import CardGeoDefensive from './CardTypes/CardGeoDefensive.vue'
import CardGeoUtility from './CardTypes/CardGeoUtility.vue'

const { t } = useI18n()

defineProps({
  card: { type: Card, required: true },
  selected: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
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
  background: var(--card-color);
  border: 1.5px solid color-mix(in srgb, var(--card-color) 80%, #000);
  border-radius: 10px;
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
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px 0 0 2px;
  z-index: 2;
}

.card-item:hover:not(.disabled):not(.selected) {
  border-color: color-mix(in srgb, var(--card-color) 60%, #000);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--card-color) 50%, transparent);
  transform: translateY(-1px);
}

.card-item.selected {
  border-color: color-mix(in srgb, var(--card-color) 60%, #000);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--card-color) 50%, transparent);
  background: color-mix(in srgb, var(--card-color) 85%, #000);
}

.card-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes card-pending-shake {
  0%, 50%, 100% {
    transform:rotate(0deg);
  }

  25%{
    transform: rotate(8deg);
  }

  75%{
    transform: rotate(-8deg);
  }
}

.card-item.pending {
  opacity: 1;
  border-color: color-mix(in srgb, var(--card-color) 60%, #000);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--card-color) 50%, transparent);
  background: color-mix(in srgb, var(--card-color) 85%, #000);
  animation: card-pending-shake 1s ease-in-out infinite;
  cursor: default;
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
  color: white;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
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
  color: #fff;
  line-height: 1.2;
}

.card-caption {
  margin: 0;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
