<template>
  <button
    class="card-item"
    :class="{ selected, disabled }"
    :style="{ '--card-color': card.color }"
    :disabled="disabled"
    @click="!disabled && $emit('select', card.id)"
  >
    <div class="card-top-bar" />
    <div class="card-body">
      <div class="card-header">
        <span class="card-name">{{ t(card.nameKey) }}</span>
        <span class="card-type-badge">{{ t(`cards.type.${card.type.toLowerCase()}`) }}</span>
      </div>
      <p class="card-caption">{{ t(card.descKey) }}</p>
    </div>
  </button>
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
.card-item {
  width: 100%;
  text-align: left;
  background: #fff;
  border: 2px solid color-mix(in srgb, var(--card-color) 40%, #e0e0e0);
  border-radius: 10px;
  padding: 0;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
  overflow: hidden;
}

.card-item:hover:not(.disabled):not(.selected) {
  border-color: var(--card-color);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--card-color) 25%, transparent);
}

.card-item.selected {
  border-color: var(--card-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--card-color) 30%, transparent);
  background: color-mix(in srgb, var(--card-color) 6%, white);
}

.card-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-top-bar {
  height: 4px;
  background: var(--card-color);
}

.card-body {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.card-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-type-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--card-color);
  background: color-mix(in srgb, var(--card-color) 12%, white);
  border: 1px solid color-mix(in srgb, var(--card-color) 30%, transparent);
  border-radius: 4px;
  padding: 1px 5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-caption {
  margin: 0;
  font-size: 0.72rem;
  color: #777;
  line-height: 1.35;
}
</style>
