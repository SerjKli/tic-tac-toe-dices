<template>
  <div class="player-buffs">
    <ExtraTurns :player="player" />
  </div>
</template>

<script setup>
import {Player} from "@/core/models/Player.js";
import SkipTurns from "@/components/game/Player/PlayerBuffs/Debuffs/SkipTurns.vue";
import ExtraTurns from "@/components/game/Player/PlayerBuffs/Buffs/ExtraTurns.vue";

defineProps({
  player: { type: Player, required: true },
})
</script>

<style scoped>
.player-buffs{
  position: absolute;
  bottom: -7px;
  left: 0;
  font-size: 0.5rem;
}
</style>