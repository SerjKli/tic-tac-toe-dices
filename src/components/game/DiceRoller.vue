<template>
  <div class="dice-roller">
    <DiceFaces :roll="roll" />
    <button class="roll-btn" :disabled="!canRoll" @click="handleRoll">
      {{ t('game.rollDice') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import DiceFaces from './DiceFaces.vue'
import { useDiceRoll } from '@/composables/useDiceRoll'

const props = defineProps({
  roll: { type: Array, default: null },
  canRoll: { type: Boolean, default: false }
})

const emit = defineEmits(['roll'])
const { t } = useI18n()
const { startRoll } = useDiceRoll()

function handleRoll() {
  if (!props.canRoll) return
  startRoll(() => emit('roll'))
}
</script>

<style scoped>
.dice-roller {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.roll-btn {
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.roll-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.roll-btn:not(:disabled):hover {
  background: #2980b9;
}
</style>
