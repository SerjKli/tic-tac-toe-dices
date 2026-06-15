<template>
  <div class="dice-face" :class="`dots-${value ?? 0}`">
    <span v-if="value !== null" class="dice-value">{{ value }}</span>
    <span v-else class="dice-value">?</span>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, default: null }
})
</script>

<style scoped>
.dice-face {
  width: 52px;
  height: 52px;
  border: 3px solid #2c2a4a;
  background: #fffdf5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--px-shadow-sm);
  user-select: none;
}

.dice-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  line-height: 1;
  color: #2c2a4a;
}

.dots-0 .dice-value {
  color: #7d7a96;
  opacity: 0.4;
}
</style>
