<template>
  <div class="game-setup">
    <GameName/>
    <p class="subtitle">{{ t('setup.subtitle') }}</p>

    <section class="section">
      <PlayerCountPicker :modelValue="settings.playerCount" @update:modelValue="settings.setPlayerCount" />
    </section>

    <section class="section players-grid">
      <PlayerCard
        v-for="(player, i) in settings.players.value"
        :key="player.id"
        :player="player"
        :index="i"
        @update="({ key, value }) => settings.updatePlayer(i, { [key]: value })"
      />
    </section>

    <button class="start-btn" @click="$emit('start')">{{ t('setup.startGame') }}</button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import PlayerCountPicker from './PlayerCountPicker.vue'
import PlayerCard from './PlayerCard.vue'
import { useSettingsStore } from '../../stores/settingsStore.js'
import GameName from "@/components/GameName.vue";

defineEmits(['start'])

const { t } = useI18n()
const settings = useSettingsStore()
</script>

<style scoped>
.game-setup {
  max-width: 680px;
  margin: 0 auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h1 {
  margin: 0;
  font-size: 2rem;
  text-align: center;
}

.subtitle {
  margin: -16px 0 0;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.start-btn {
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  background: #27ae60;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.start-btn:hover {
  background: #229954;
}
</style>
