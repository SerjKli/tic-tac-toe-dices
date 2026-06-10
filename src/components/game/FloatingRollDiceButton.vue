<template>
  <div class="floating-button-wrapper">
    <button class="roll-dice-fab chat-fab" :disabled="!canRoll" @click="handleRoll">
      🎲
    </button>
  </div>
</template>

<script setup>
import { useDiceRoll } from '@/composables/useDiceRoll'

const props = defineProps({
  canRoll: { type: Boolean, default: false }
})

const emit = defineEmits(['roll'])
const { startRoll } = useDiceRoll()

function handleRoll() {
  if (!props.canRoll) return
  startRoll(() => emit('roll'))
}
</script>

<style scoped>
</style>
