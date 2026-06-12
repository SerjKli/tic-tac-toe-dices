<template>
  <div class="player-strip">
    <div
      v-for="player in players"
      :key="player.id"
      class="player-chip"
      :class="{ active: player.id === currentPlayerId }"
      :style="{ '--player-color': player.color }"
    >
      <span class="mark">{{ player.mark }}</span>
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

defineProps({
  players: { type: Array, required: true },
  currentPlayerId: { type: String, default: null },
  playerEmojis: { type: Object, default: () => ({}) }
})
</script>

<style scoped>

.mark {
  font-size: 1.2rem;
  line-height: 1;
}

.name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--player-color);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-emoji {
  font-size: 1.1rem;
  line-height: 1;
  background-color: #ffffff;
  border-radius: 50%;
  padding: 6px;
  position: absolute;
  top: -12px;
  left: -12px;
}

.chat-emoji::after {
  content: "";
  width: 4px;
  height: 4px;
  background-color: #fff;
  position: absolute;
  bottom: 0;
  border-radius: 4px;
}

</style>
