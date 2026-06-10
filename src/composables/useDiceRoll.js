import { ref } from 'vue'

// Module-level singletons — shared across all component instances
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

export function useDiceRoll() {
  function notifyRollArrived() {
    if (isAnimating.value) land()
  }

  function startRoll(onRollEmit) {
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
      onRollEmit()
      safetyTimeoutId = setTimeout(land, 2000)
    }, 700)
  }

  return { isAnimating, justLanded, animValues, startRoll, notifyRollArrived }
}
