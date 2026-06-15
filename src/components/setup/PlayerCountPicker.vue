<template>
  <div class="count-buttons">
    <button
      v-for="n in options"
      :key="n"
      class="px-count-btn"
      :class="{ active: modelValue === n }"
      @click="$emit('update:modelValue', n)"
    >{{ n }}</button>
  </div>
</template>

<script setup>
import { MIN_PLAYERS, MAX_PLAYERS } from '../../core/constants.js'

defineProps({
  modelValue: { type: Number, required: true }
})

defineEmits(['update:modelValue'])

const options = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i)
</script>

<style scoped>
.count-buttons {
  display: flex;
  gap: 14px;
  margin-bottom: 0;
}

.px-count-btn {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #2c2a4a;
  cursor: pointer;
  border: 4px solid #2c2a4a;
  background: #fffdf5;
  box-shadow: 4px 4px 0 #2c2a4a;
  user-select: none;
  transition: transform 0.08s, box-shadow 0.08s;
}

.px-count-btn:hover  { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #2c2a4a; }
.px-count-btn.active { background: #ffd23f; }
</style>
