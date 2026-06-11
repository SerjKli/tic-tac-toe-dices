import { ref } from 'vue'

// Module-level singletons — shared across all component instances
const isAnimating = ref(false)
const justLanded = ref(false)
const showingResult = ref(false)
const animValues = ref([1, 1])
let intervalId = null
let timeoutId = null
let showingResultTimeoutId = null

export function useDiceRoll() {
  function notifyRollArrived() {
    if (isAnimating.value) {
      isAnimating.value = false
      justLanded.value = true
      setTimeout(() => { justLanded.value = false }, 500)
    }
  }

  function startRoll(onRollEmit) {
    isAnimating.value = true
    justLanded.value = false
    showingResult.value = false

    clearInterval(intervalId)
    clearTimeout(timeoutId)
    clearTimeout(showingResultTimeoutId)

    intervalId = setInterval(() => {
      animValues.value = [
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
      ]
    }, 80)

    timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      isAnimating.value = false
      justLanded.value = true
      setTimeout(() => { justLanded.value = false }, 500)
      onRollEmit()
      showingResult.value = true
      showingResultTimeoutId = setTimeout(() => {
        showingResult.value = false
      }, 700)
    }, 700)
  }

  return { isAnimating, justLanded, showingResult, animValues, startRoll, notifyRollArrived }
}
