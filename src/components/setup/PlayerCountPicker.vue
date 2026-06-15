<template>
  <div class="count-buttons">
    <button
      v-for="n in options"
      :key="n"
      class="action-btn"
      :class="{ 'btn-success': modelValue === n }"
      @click="$emit('update:modelValue', n)"
    >{{ n }}</button>
  </div>
</template>

<script setup>
import { MIN_PLAYERS, MAX_PLAYERS } from '@/core/constants.js'

defineProps({
  modelValue: { type: Number, required: true }
})

defineEmits(['update:modelValue'])

const options = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i)
</script>

<style scoped>
</style>
