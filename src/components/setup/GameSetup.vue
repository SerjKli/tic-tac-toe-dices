<template>
  <div class="game-setup">
    <GameName/>
    <p class="subtitle">{{ t('setup.subtitle') }}</p>

    <section class="section">
      <PlayerCountPicker :modelValue="settings.playerCount" @update:modelValue="settings.setPlayerCount" />
    </section>

    <section class="section game-mode-toggle">
      <p class="section-label">{{ t('setup.modelNetworkLabel') }}</p>
      <div class="toggle-row">
        <button
            class="mode-btn"
            :class="{ active: mode === 'local' }"
            @click="mode = 'local'"
        >{{ t('setup.modeLocal') }}</button>
        <button
            class="mode-btn"
            :class="{ active: mode === 'online' }"
            @click="mode = 'online'"
        >{{ t('setup.modeOnline') }}</button>
      </div>
    </section>

    <section class="section game-mode-toggle game-mode-difficulty">
      <p class="section-label">{{ t('setup.gameModeLabel') }}</p>
      <div class="toggle-row">
        <button
          class="mode-btn"
          :class="{ active: settings.gameMode === 'CLASSIC' }"
          @click="settings.gameMode = 'CLASSIC'"
        >{{ t('setup.gameModeClassic') }}</button>
        <button
          class="mode-btn"
          :class="{ active: settings.gameMode === 'ADVANCED' }"
          @click="settings.gameMode = 'ADVANCED'"
        >{{ t('setup.gameModeAdvanced') }}</button>
      </div>
<!--      <p v-if="settings.gameMode === 'ADVANCED'" class="mode-hint">{{ t('setup.gameModeAdvancedHint') }}</p>-->
    </section>

    <div class="section">
      <button class="start-btn" @click="$emit('start', { mode })">
        {{ mode === 'online' ? t('setup.createRoom') : t('setup.startGame') }}
      </button>
    </div>

    <section v-if="mode === 'local'" class="section players-grid">
      <PlayerCard
        v-for="(player, i) in settings.players"
        :key="player.id"
        :player="player"
        :index="i"
        @update="({ key, value }) => settings.updatePlayer(i, { [key]: value })"
      />
    </section>

    <template v-else>
      <section class="section">
        <p class="online-hint">{{ t('setup.onlineHint') }}</p>
        <PlayerCard
          :player="settings.players[0]"
          :index="0"
          @update="({ key, value }) => settings.updatePlayer(0, { [key]: value })"
        />
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PlayerCountPicker from './PlayerCountPicker.vue'
import PlayerCard from './PlayerCard.vue'
import { useSettingsStore } from '@/stores/settingsStore.js'
import GameName from '@/components/GameName.vue'

defineEmits(['start'])

const { t } = useI18n()
const settings = useSettingsStore()
const mode = ref('local')
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

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}



.mode-btn {
  flex: 1;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  background: #fff;
  color: #27ae60;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.mode-btn.active {
  background: #27ae60;
  color: #fff;
}

.online-hint {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
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
