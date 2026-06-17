<template>
  <div class="player-strip">
    <div
      v-for="player in players"
      :key="player.id"
      class="player-chip"
      :class="{ active: player.id === currentPlayerId }"
      :style="{ '--player-color': player.color }"
    >
      <Mark :mark="player.mark" />
      <span class="name">{{ player.name }}</span>
      <span v-if="playerEmojis[player.id]" class="chat-emoji pop-in" :key="playerEmojis[player.id]">{{ playerEmojis[player.id] }}</span>

      <PlayerBuffs :player="player" />

      <CardsHand :player="player" />
    </div>
  </div>
</template>

<script setup>
import PlayerBuffs from "@/components/game/Player/PlayerBuffs/PlayerBuffs.vue";
import CardsHand from "@/components/game/Player/CardsHand.vue";
import Mark from "@/components/game/Mark.vue";

defineProps({
  players: { type: Array, required: true },
  currentPlayerId: { type: String, default: null },
  playerEmojis: { type: Object, default: () => ({}) }
})
</script>

<style scoped>
</style>
