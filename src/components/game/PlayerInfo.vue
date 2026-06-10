<template>
  <div class="player-info" :style="{ '--player-color': player.color }">
    <span class="player-mark">{{ player.mark }}</span>
    <div class="player-details">
      <span class="player-name">{{ player.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  player: { type: Object, required: true }
})

const { t } = useI18n()
</script>

<style scoped>
.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 3px solid var(--player-color);
  background: color-mix(in srgb, var(--player-color) 10%, white);
}

.player-mark {
  font-size: 2rem;
  line-height: 1;
}

.player-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--player-color);
}

.player-turn {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
