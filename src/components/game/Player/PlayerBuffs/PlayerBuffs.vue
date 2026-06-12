<template>
  <div class="all-player-debuffs">
    <Buffs :player="player" />
    <Debuffs :player="player" />
  </div>
</template>

<script setup>
import {Player} from "@/core/models/Player.js";
import Debuffs from "@/components/game/Player/PlayerBuffs/Debuffs/Debuffs.vue";
import Buffs from "@/components/game/Player/PlayerBuffs/Buffs/Buffs.vue";

defineProps({
  player: { type: Player, required: true },
})
</script>

<style scoped>
.player-debuffs, .player-buffs{
  position: absolute;
  bottom: -4px;
  left: 0;
  font-size: 0.5rem;
}

.player-buffs{
  right: 0;
}
</style>