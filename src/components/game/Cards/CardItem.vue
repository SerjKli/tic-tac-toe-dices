<template>
  <div
    class="card-item"
    :class="[`type-${card.type.toLowerCase()}`, { selected, disabled, pending,  'pop-in' : animation} ]"
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
  cardAmount: { type: Number, default: 1 },
  animation: { type: Boolean, default: true },
})

defineEmits(['select'])
</script>

<style scoped>
</style>
