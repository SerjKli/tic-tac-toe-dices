<template>
  <div class="setup-page">
    <div class="setup-content">
      <GameName />

      <!-- info ribbon -->
      <div class="ribbon-wrap">
        <div class="info-ribbon">
          {{ t('setup.subtitle') }}
        </div>
      </div>


      <div class="px-label">
        {{ t('setup.playersNumber') }}
      </div>
      <PlayerCountPicker
        :modelValue="settings.playerCount"
        @update:modelValue="settings.setPlayerCount"
      />

      <div class="px-label" style="margin-top:32px">
       {{ t('setup.modelNetworkLabel') }}
      </div>
      <div class="seg-toggle" style="margin-bottom:30px">
        <div class="seg-btn" :class="{ active: mode === 'local', 'seg-green': mode === 'local' }" @click="mode = 'local'">{{ t('setup.modeLocal') }}</div>
        <div class="seg-divider"></div>
        <div class="seg-btn" :class="{ active: mode === 'online', 'seg-blue': mode === 'online' }" @click="mode = 'online'">{{ t('setup.modeOnline') }}</div>
      </div>

      <!-- game mode -->
      <div class="px-label">
        {{ t('setup.gameModeLabel') }}
      </div>
      <div class="seg-toggle" style="margin-bottom:34px">
        <div class="seg-btn" :class="{ active: settings.gameMode === 'CLASSIC', 'seg-purple': settings.gameMode === 'CLASSIC' }" @click="settings.gameMode = 'CLASSIC'">{{ t('setup.gameModeClassic') }}</div>
        <div class="seg-divider"></div>
        <div class="seg-btn" :class="{ active: settings.gameMode === 'ADVANCED', 'seg-purple': settings.gameMode === 'ADVANCED' }" @click="settings.gameMode = 'ADVANCED'">{{ t('setup.gameModeAdvanced') }}</div>
      </div>

      <!-- start button -->
      <div class="action-btn btn-success"
           style="margin-bottom:32px; padding: 24px;"
           @click="$emit('start', { mode })">
        ▶ {{ mode === 'online' ? t('setup.createRoom') : t('setup.startGame') }}
      </div>

      <!-- player cards -->
      <div class="players-grid">
        <template v-if="mode === 'local'">
          <PlayerCard
            v-for="(player, i) in settings.players"
            :key="player.id"
            :player="player"
            :index="i"
            @update="({ key, value }) => settings.updatePlayer(i, { [key]: value })"
          />
        </template>
        <template v-else>
          <PlayerCard
            :player="settings.players[0]"
            :index="0"
            @update="({ key, value }) => settings.updatePlayer(0, { [key]: value })"
          />
        </template>
      </div>
    </div>
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
.setup-page {
  padding: 34px 16px 70px;
}

/* ── content ── */
.setup-content {
  max-width: 768px;
  margin: 0 auto;
  position: relative;
}

/* ── info ribbon ── */
.ribbon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 34px;
}

.info-ribbon {
  background: #fffdf5;
  border: 4px solid #2c2a4a;
  box-shadow: 4px 4px 0 #2c2a4a;
  padding: 9px 18px 6px;
  font-size: 21px;
  color: #2c2a4a;
  letter-spacing: 0.5px;
  text-align: center;
}

/* ── start button ── */
.start-px {
  font-family: 'Press Start 2P', monospace;
  font-size: 19px;
  color: #fff;
  text-align: center;
  background: #54c46a;
  border: 4px solid #2c2a4a;
  box-shadow: 6px 6px 0 #2c2a4a;
  padding: 22px;
  cursor: pointer;
  text-shadow: 3px 3px 0 #2f8f44;
  margin-bottom: 42px;
  user-select: none;
  transition: transform 0.08s, box-shadow 0.08s;
}

.start-px:hover  { transform: translate(-2px, -2px); box-shadow: 8px 8px 0 #2c2a4a; }
.start-px:active { transform: translate(6px, 6px);   box-shadow: 0 0 0 #2c2a4a; }

/* ── players grid ── */
.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 22px;
}
</style>
