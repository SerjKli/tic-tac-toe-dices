<template>
  <div class="floating-button-wrapper" id="show-game-board">
    <button
      class="roll-dice-fab chat-fab"
      @mousedown="show"
      @touchstart.prevent="show"
      @mouseup="hide"
      @mouseleave="hide"
      @touchend="hide"
      @touchcancel="hide"
    >
      👀
    </button>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/gameStore.js'

const game = useGameStore()

function show() { game.showingBoard = true }
function hide() { game.showingBoard = false }
</script>

<style scoped>
#show-game-board{
  right: 88px;
}
</style>
