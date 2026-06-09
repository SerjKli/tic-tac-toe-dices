<template>
  <div class="scoreboard">
    <h3>{{ t('game.players') }}</h3>
    <ul>
      <li
        v-for="player in players"
        :key="player.id"
        class="player-row"
        :class="{ active: player.id === currentPlayerId }"
        :style="{ '--player-color': player.color }"
      >
        <span class="mark">{{ player.mark }}</span>
        <span class="name">{{ player.name }}</span>
        <span class="pieces">{{ t('game.pieces', { count: piecesOnBoard(player.id) }) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  players: { type: Array, required: true },
  board: { type: Object, required: true },
  currentPlayerId: { type: String, default: null }
})

const { t } = useI18n()

function piecesOnBoard(playerId) {
  return props.board.cells().filter(c => c.ownerId === playerId).length
}
</script>

<style scoped>
.scoreboard h3 {
  margin: 0 0 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.player-row.active {
  border-color: var(--player-color);
  background: color-mix(in srgb, var(--player-color) 8%, white);
}

.mark {
  font-size: 1.3rem;
  width: 1.8rem;
  text-align: center;
}

.name {
  flex: 1;
  font-weight: 600;
  color: var(--player-color);
}

.pieces {
  font-size: 0.8rem;
  color: #888;
}
</style>
