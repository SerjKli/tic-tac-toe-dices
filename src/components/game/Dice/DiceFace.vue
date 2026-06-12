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
  border: 3px solid #333;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.15);
  user-select: none;
}

.dice-value {
  line-height: 1;
}
</style>
