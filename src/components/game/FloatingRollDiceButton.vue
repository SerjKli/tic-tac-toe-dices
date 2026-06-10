<template>
  <div class="floating-button-wrapper">
    <button
        class="roll-dice-fab chat-fab"
        :disabled="!canRoll"
        @click="startRoll"
    >
      🎲
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  roll: { type: Array, default: null },
  canRoll: { type: Boolean, default: false }
})

const emit = defineEmits(['roll'])
const { t } = useI18n()

const isAnimating = ref(false)
const justLanded = ref(false)
const animValues = ref([1, 1])
let intervalId = null
let timeoutId = null
let safetyTimeoutId = null

function land() {
  clearTimeout(safetyTimeoutId)
  isAnimating.value = false
  justLanded.value = true
  setTimeout(() => { justLanded.value = false }, 500)
}

// Trigger landing once the real roll result arrives
watch(() => props.roll, (newRoll) => {
  if (isAnimating.value && newRoll !== null) land()
})

function startRoll() {
  if (!props.canRoll) return

  isAnimating.value = true
  justLanded.value = false

  clearInterval(intervalId)
  clearTimeout(timeoutId)
  clearTimeout(safetyTimeoutId)

  intervalId = setInterval(() => {
    animValues.value = [
      Math.ceil(Math.random() * 6),
      Math.ceil(Math.random() * 6),
    ]
  }, 80)

  timeoutId = setTimeout(() => {
    clearInterval(intervalId)
    emit('roll') // emit after animation so candidates appear only when landing
    // Safety fallback in case props.roll doesn't arrive (e.g. network delay)
    safetyTimeoutId = setTimeout(land, 2000)
  }, 700)
}
</script>

<style scoped>

</style>
