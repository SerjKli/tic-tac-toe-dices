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

</style>
