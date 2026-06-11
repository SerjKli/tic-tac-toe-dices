<template>
  <span v-if="hasShield" class="shield-badge appear-in">
    <span class="material-icons">shield</span>
  </span>

</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cell: { type: Object, required: true },
})

const hasShield = computed(() => (props.cell.shieldCount ?? 0) > 0)

</script>

<style scoped>
.shield-badge {
  position: absolute;
  line-height: 1;
  top: 14px;
  color: #e3e3e3;
}
.shield-badge .material-icons{
  font-size: 48px;
}
</style>