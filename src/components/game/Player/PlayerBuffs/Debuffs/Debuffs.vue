<template>
  <div class="player-debuffs">
    <SkipTurns :player="player" v-if="player.skipTurnCount" />
  </div>
</template>

<script setup>
import {Player} from "@/core/models/Player.js";
import SkipTurns from "@/components/game/Player/PlayerBuffs/Debuffs/SkipTurns.vue";

defineProps({
  player: { type: Player, required: true },
})
</script>

<style scoped>

</style>