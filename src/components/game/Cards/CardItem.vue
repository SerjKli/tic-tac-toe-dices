<template>
  <div
    class="card-item"
    :class="{ selected, disabled }"
    :style="{ '--card-color': card.color }"
    :disabled="disabled"
    @click="!disabled && $emit('select', card.id)"
  >
    <div class="card-top-bar" />
    <div class="card-header">
        <span class="card-type-badge">{{ t(`cards.type.${card.type.toLowerCase()}`) }}</span>
    </div>
    <div class="card-body">
      <span class="card-name">{{ t(card.nameKey) }}</span>
      <p class="card-caption">{{ t(card.descKey) }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  card: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['select'])
</script>

<style scoped>

</style>
