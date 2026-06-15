<template>
  <template v-if="hasShield">
      <span  class="shield-badge appear-in"><span class="material-icons">shield</span></span>

      <span  class="shield-badge appear-in" v-for="i in props.cell.shieldCount-1" :style="{
        left: `${(i-1)*5}px`,
      }">
        <span class="material-icons">shield</span>
      </span>
  </template>


</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cell: { type: Object, required: true },
})

const hasShield = computed(() => (props.cell.shieldCount ?? 0) > 0)

</script>

<style scoped>

</style>