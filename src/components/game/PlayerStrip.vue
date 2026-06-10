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
      <span v-if="playerEmojis[player.id]" class="chat-emoji">{{ playerEmojis[player.id] }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  players: { type: Array, required: true },
  currentPlayerId: { type: String, default: null },
  playerEmojis: { type: Object, default: () => ({}) }
})
</script>

<style scoped>
.player-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  width: 100%;
}

.player-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 2px solid transparent;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: border-color 0.15s;
}

.player-chip.active {
  border-color: var(--player-color);
  background: color-mix(in srgb, var(--player-color) 8%, white);
}

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
  animation: pop-in 0.2s ease;
}

@keyframes pop-in {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
