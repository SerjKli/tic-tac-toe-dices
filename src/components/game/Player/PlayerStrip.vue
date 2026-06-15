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

.mark {
  font-size: 1.3rem;
  line-height: 1;
}

.name {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--player-color);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-emoji {
  font-size: 1.1rem;
  line-height: 1;
  background-color: #fffdf5;
  border: 2px solid #2c2a4a;
  box-shadow: var(--px-shadow-sm);
  padding: 4px;
  position: absolute;
  top: -14px;
  left: -14px;
}

.chat-emoji::after {
  content: "";
  width: 4px;
  height: 4px;
  background-color: #fffdf5;
  position: absolute;
  bottom: 0;
  right: 0;
}

</style>
