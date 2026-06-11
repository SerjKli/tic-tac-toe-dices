<template>
  <div class="player-debuffs">
    <SkipTurns :player="player" v-if="player.skipTurnCount" />
  </div>
</template>

<script setup>
import {Player} from "@/core/models/Player.js";
import SkipTurns from "@/components/game/PlayerDebuffs/SkipTurns.vue";

defineProps({
  player: { type: Player, required: true },
})
</script>

<style scoped>
.player-debuffs{
  position: absolute;
  bottom: -7px;
  left: 0;
  font-size: 0.5rem;
}
</style>