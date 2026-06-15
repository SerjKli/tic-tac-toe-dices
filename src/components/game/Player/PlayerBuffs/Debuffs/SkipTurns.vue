<template>
  <div class="player-skip-turns pop-in player-debuff-item">
    <span v-for="i in player.skipTurnCount">❌</span>
  </div>
</template>


<script setup>
import {Player} from "@/core/models/Player.js";

defineProps({
  player: { type: Player, required: true },
})
</script>

<style scoped>

</style>