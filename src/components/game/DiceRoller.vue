<template>
  <div class="dice-roller">
    <div class="dice-faces">
      <div class="dice-pair" :class="{ 'dice-placeholder': !showDice }">
        <div class="die-wrap" :class="{ rolling: isAnimating, landed: justLanded }">
          <DiceFace :value="displayValues[0]" />
        </div>
        <div class="die-wrap die-wrap--second" :class="{ rolling: isAnimating, landed: justLanded }">
          <DiceFace :value="displayValues[1]" />
        </div>
      </div>
    </div>
    <button
      class="roll-btn"
      :disabled="!canRoll"
      @click="startRoll"
    >
      {{ t('game.rollDice') }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DiceFace from './DiceFace.vue'

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

const showDice = computed(() => isAnimating.value || props.roll !== null)

const displayValues = computed(() => {
  if (isAnimating.value) return animValues.value
  if (props.roll) return [props.roll[0] + 1, props.roll[1] + 1]
  return [null, null]
})

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
.dice-roller {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.dice-pair {
  display: flex;
  gap: 12px;
}

.dice-placeholder {
  opacity: 0.3;
}

.die-wrap {
  display: inline-flex;
}

.die-wrap.rolling {
  animation: dice-roll 0.14s ease-in-out infinite;
}

.die-wrap--second.rolling {
  animation-delay: 0.04s;
}

.die-wrap.landed {
  animation: dice-land 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
}

.die-wrap--second.landed {
  animation-delay: 0.06s;
}

@keyframes dice-roll {
  0%   { transform: rotate(0deg) scale(1); }
  20%  { transform: rotate(-18deg) scale(1.08); }
  50%  { transform: rotate(18deg) scale(0.93); }
  80%  { transform: rotate(-10deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); }
}

@keyframes dice-land {
  0%   { transform: scale(1.35) rotate(6deg); }
  40%  { transform: scale(0.88) rotate(-3deg); }
  70%  { transform: scale(1.08) rotate(1deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.roll-btn {
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.roll-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.roll-btn:not(:disabled):hover {
  background: #2980b9;
}
</style>
