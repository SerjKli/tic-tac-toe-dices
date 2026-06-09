<template>
  <div class="dice-roller">
    <div class="dice-faces">
      <div v-if="roll" class="dice-pair">
        <DiceFace :value="roll[0] + 1" />
        <DiceFace :value="roll[1] + 1" />
      </div>
      <div v-else class="dice-placeholder">
        <DiceFace :value="null" />
        <DiceFace :value="null" />
      </div>
    </div>
    <button
      class="roll-btn"
      :disabled="!canRoll"
      @click="$emit('roll')"
    >
      {{ t('game.rollDice') }}
    </button>
    <p v-if="isDoubles" class="doubles-notice">{{ t('game.doubles') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DiceFace from './DiceFace.vue'

const props = defineProps({
  roll: { type: Array, default: null },
  canRoll: { type: Boolean, default: false }
})

defineEmits(['roll'])

const { t } = useI18n()
const isDoubles = computed(() => props.roll && props.roll[0] === props.roll[1])
</script>

<style scoped>
.dice-roller {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.dice-pair {
  display: flex;
  gap: 12px;
}

.dice-placeholder {
  display: flex;
  gap: 12px;
  opacity: 0.3;
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

.doubles-notice {
  font-weight: 600;
  color: #e67e22;
  margin: 0;
}
</style>
