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

