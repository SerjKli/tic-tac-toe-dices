<template>
  <button
    class="game-cell"
    :class="[`action-${candidateAction ?? 'none'}`, { 'is-candidate': isCandidateCell, 'has-shield': hasShield }]"
    :style="ownerColor ? { '--owner-color': ownerColor } : {}"
    :disabled="!isCandidateCell"
    @click="$emit('click', { row: cell.row, col: cell.col })"
  >
    <span v-if="cell.ownerId" class="cell-mark cell-mark-bounce-in">
      <Mark :mark="playerMark" />
    </span>

    <GameCellEffects :cell="props.cell"/>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import GameCellEffects from "@/components/game/Board/GameCellEffects.vue";
import Mark from "@/components/game/Mark.vue";

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
  border: 3px solid #2c2a4a;
  background: #fffdf5;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, 7vw, 2rem);
  transition: background 0.08s, transform 0.08s, border-color 0.08s, box-shadow 0.08s;
  color: var(--owner-color, #2c2a4a);
  position: relative;
}

.game-cell.is-candidate {
  cursor: pointer;
}

.game-cell.action-PLACE.is-candidate {
  border-color: #54c46a;
  background: color-mix(in srgb, #54c46a 12%, #fffdf5);
  box-shadow: inset 0 0 0 2px #54c46a;
}

.game-cell.action-CAPTURE.is-candidate {
  border-color: #ef4444;
  background: color-mix(in srgb, #ef4444 10%, #fffdf5);
  box-shadow: inset 0 0 0 2px #ef4444;
}

.game-cell.action-EXPLODE.is-candidate {
  border-color: #f59e0b;
  background: color-mix(in srgb, #f59e0b 12%, #fffdf5);
  box-shadow: inset 0 0 0 2px #f59e0b;
}

.game-cell.is-candidate:hover {
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0 #2c2a4a;
}

.game-cell.action-PLACE.is-candidate:hover {
  box-shadow: 2px 2px 0 #54c46a;
}

.game-cell.action-CAPTURE.is-candidate:hover {
  box-shadow: 2px 2px 0 #ef4444;
}

.game-cell.action-EXPLODE.is-candidate:hover {
  box-shadow: 2px 2px 0 #f59e0b;
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
