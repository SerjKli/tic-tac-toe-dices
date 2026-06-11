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
      <span v-if="playerEmojis[player.id]" class="chat-emoji" :key="playerEmojis[player.id]">{{ playerEmojis[player.id] }}</span>

      <PlayerDebuffs :player="player" />
    </div>
  </div>
</template>

<script setup>
import PlayerDebuffs from "@/components/game/PlayerDebuffs/PlayerDebuffs.vue";

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
  animation: emoji-pop 0.55s ease forwards;
  transform-origin: center bottom;
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

@keyframes emoji-pop {
  0%   { transform: scale(0) rotate(-25deg) translateY(10px); opacity: 0; filter: blur(3px); }
  45%  { transform: scale(1.45) rotate(10deg) translateY(-8px); opacity: 1; filter: blur(0); }
  65%  { transform: scale(0.82) rotate(-5deg) translateY(2px); }
  80%  { transform: scale(1.15) rotate(3deg) translateY(-2px); }
  92%  { transform: scale(0.95) rotate(-1deg) translateY(0); }
  100% { transform: scale(1) rotate(0deg) translateY(0); opacity: 1; }
}
</style>
