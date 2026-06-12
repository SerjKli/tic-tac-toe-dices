<template>
  <button
    class="game-cell"
    :class="[`action-${candidateAction ?? 'none'}`, { 'is-candidate': isCandidateCell, 'has-shield': hasShield }]"
    :style="ownerColor ? { '--owner-color': ownerColor } : {}"
    :disabled="!isCandidateCell"
    @click="$emit('click', { row: cell.row, col: cell.col })"
  >
    <span v-if="cell.ownerId" class="cell-mark">{{ playerMark }}</span>

    <GameCellEffects :cell="props.cell"/>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import GameCellEffects from "@/components/game/Board/GameCellEffects.vue";

const props = defineProps({
  cell: { type: Object, required: true },
  players: { type: Array, required: true },
  isCandidateCell: { type: Boolean, default: false },
  candidateAction: { type: String, default: null }
})

defineEmits(['click'])

const owner = computed(() =>
  props.cell.ownerId ? props.players.find(p => p.id === props.cell.ownerId) : null
)
const playerMark = computed(() => owner.value?.mark ?? '')
const ownerColor = computed(() => owner.value?.color ?? null)
</script>

<style scoped>
.game-cell {
  aspect-ratio: 1;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, 7vw, 2rem);
  transition: background 0.15s, transform 0.1s, border-color 0.15s;
  color: var(--owner-color, #333);
  position: relative;
}

.game-cell.is-candidate {
  cursor: pointer;
}

.game-cell.action-PLACE.is-candidate {
  border-color: #27ae60;
  background: #eafaf1;
}

.game-cell.action-CAPTURE.is-candidate {
  border-color: #e74c3c;
  background: #fdf3f2;
}

.game-cell.action-EXPLODE.is-candidate {
  border-color: #ff6b00;
  background: #fff3e0;
  box-shadow: 0 0 0 2px #ff6b0044;
}

.game-cell.is-candidate:hover {
  transform: scale(1.06);
}

.game-cell.has-shield {
  position: relative;
}

.cell-mark {
  display: block;
  line-height: 1;
  user-select: none;
  z-index: 9;
}

</style>
