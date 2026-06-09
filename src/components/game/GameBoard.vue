<template>
  <div class="game-board" :style="{ '--board-size': boardSize }">
    <GameCell
      v-for="cell in cells"
      :key="`${cell.row}-${cell.col}`"
      :cell="cell"
      :players="players"
      :isCandidateCell="isCandidateCell(cell.row, cell.col)"
      :candidateAction="getCandidateAction(cell.row, cell.col)"
      :class="{ 'win-cell': isWinCell(cell.row, cell.col) }"
      @click="$emit('cell-click', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GameCell from './GameCell.vue'
import { BOARD_SIZE } from '../../core/constants.js'

const props = defineProps({
  board: { type: Object, required: true },
  players: { type: Array, required: true },
  isCandidateCell: { type: Function, required: true },
  getCandidateAction: { type: Function, required: true },
  winCells: { type: Array, default: () => [] }
})

defineEmits(['cell-click'])

const boardSize = BOARD_SIZE
const cells = computed(() => props.board.cells())

function isWinCell(row, col) {
  return props.winCells.some(c => c.row === row && c.col === col)
}
</script>

<style scoped>
.game-board {
  display: grid;
  grid-template-columns: repeat(var(--board-size), 1fr);
  gap: 6px;
  max-width: min(90vw, 480px);
  width: 100%;
}

.win-cell :deep(.game-cell) {
  background: #fff9c4;
  border-color: #f1c40f;
}
</style>
