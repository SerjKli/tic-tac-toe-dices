<template>
  <span class="mark-item">
    {{ mark }}2
  </span>
</template>

<script setup>

 defineProps({
   mark: { type: String, required: true },

 })
</script>


<style scoped>

</style>