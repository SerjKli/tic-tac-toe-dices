<template>
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
</template>

<script setup>
import { computed, watch } from 'vue'
import DiceFace from './DiceFace.vue'
import { useDiceRoll } from '@/composables/useDiceRoll'

const props = defineProps({
  roll: { type: Array, default: null }
})

const { isAnimating, justLanded, animValues, notifyRollArrived } = useDiceRoll()

const showDice = computed(() => isAnimating.value || props.roll !== null)

const displayValues = computed(() => {
  if (isAnimating.value) return animValues.value
  if (props.roll) return [props.roll[0] + 1, props.roll[1] + 1]
  return [null, null]
})

watch(() => props.roll, (newRoll) => {
  if (newRoll !== null) notifyRollArrived()
})
</script>

<style scoped>
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
</style>
