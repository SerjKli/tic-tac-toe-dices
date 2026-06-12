<template>
  <div class="player-extra-turns pop-in">
    <span v-for="i in player.extraTurnCount" :index="`p-extra-turn-${player.id}-${i}`">🔁</span>
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