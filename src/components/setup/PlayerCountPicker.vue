<template>
  <div class="count-picker">
    <label>{{ t('setup.playersNumber') }}</label>
    <div class="count-buttons">
      <button
        v-for="n in options"
        :key="n"
        class="count-btn"
        :class="{ active: modelValue === n }"
        @click="$emit('update:modelValue', n)"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { MIN_PLAYERS, MAX_PLAYERS } from '../../core/constants.js'
import {useI18n} from "vue-i18n";

const { t } = useI18n()
defineProps({
  modelValue: { type: Number, required: true }
})

defineEmits(['update:modelValue'])

const options = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i)
</script>

<style scoped>
.count-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-weight: 600;
  color: #555;
}

.count-buttons {
  display: flex;
  gap: 10px;
}

.count-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.count-btn.active {
  border-color: #3498db;
  background: #ebf5fb;
  color: #3498db;
}
</style>
