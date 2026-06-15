<template>
  <div class="setup-page">
    <!-- ambient pixel scenery -->
    <div class="scenery" aria-hidden="true">
      <span class="cloud cloud-1"></span>
      <span class="cloud cloud-2"></span>
      <span class="cloud cloud-3"></span>
      <div class="sun"></div>
    </div>

    <div class="setup-content">
      <GameName />

      <!-- info ribbon -->
      <div class="ribbon-wrap">
        <div class="info-ribbon">
          6×6 BOARD &nbsp;·&nbsp; 3 IN A ROW &nbsp;·&nbsp; DICE PICK YOUR CELL
        </div>
      </div>

      <!-- number of players -->
      <div class="px-label">NUMBER OF PLAYERS</div>
      <PlayerCountPicker
        :modelValue="settings.playerCount"
        @update:modelValue="settings.setPlayerCount"
      />

      <!-- play with who -->
      <div class="px-label" style="margin-top:32px">PLAY WITH WHO?</div>
      <div class="seg-toggle" style="margin-bottom:30px">
        <div class="seg-btn" :class="{ active: mode === 'local', 'seg-green': mode === 'local' }" @click="mode = 'local'">LOCAL</div>
        <div class="seg-divider"></div>
        <div class="seg-btn" :class="{ active: mode === 'online', 'seg-blue': mode === 'online' }" @click="mode = 'online'">ONLINE</div>
      </div>

      <!-- game mode -->
      <div class="px-label">GAME MODE</div>
      <div class="seg-toggle" style="margin-bottom:34px">
        <div class="seg-btn" :class="{ active: settings.gameMode === 'CLASSIC', 'seg-purple': settings.gameMode === 'CLASSIC' }" @click="settings.gameMode = 'CLASSIC'">CLASSIC</div>
        <div class="seg-divider"></div>
        <div class="seg-btn" :class="{ active: settings.gameMode === 'ADVANCED', 'seg-purple': settings.gameMode === 'ADVANCED' }" @click="settings.gameMode = 'ADVANCED'">ADVANCED</div>
      </div>

      <!-- start button -->
      <div class="start-px" @click="$emit('start', { mode })">
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
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(#aee6ff 0%, #cdf3ff 45%, #dff7e6 100%);
  font-family: 'VT323', monospace;
  position: relative;
  overflow-x: hidden;
  padding: 34px 16px 70px;
}

/* ── ambient scenery ── */
.scenery {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.cloud {
  position: absolute;
  background: #fff;
  opacity: 0.92;
  display: block;
}

.cloud-1 {
  top: 42px; left: 7%;
  width: 16px; height: 16px;
  box-shadow: 16px 0 #fff, 32px 0 #fff, 48px 0 #fff, 16px -16px #fff, 32px -16px #fff;
  animation: px-floaty 7s ease-in-out infinite;
}

.cloud-2 {
  top: 150px; right: 9%;
  width: 14px; height: 14px;
  opacity: 0.85;
  box-shadow: 14px 0 #fff, 28px 0 #fff, 42px 0 #fff, 14px -14px #fff, 28px -14px #fff;
  animation: px-floaty2 9s ease-in-out infinite;
}

.cloud-3 {
  top: 330px; left: 4%;
  width: 12px; height: 12px;
  opacity: 0.7;
  box-shadow: 12px 0 #fff, 24px 0 #fff, 12px -12px #fff;
  animation: px-floaty 11s ease-in-out infinite;
}

.sun {
  position: absolute;
  top: 34px; right: 5%;
  width: 46px; height: 46px;
  background: #ffd23f;
  border: 4px solid #2c2a4a;
  box-shadow: -10px 0 #ffd23f, 10px 0 #ffd23f, 0 -10px #ffd23f, 0 10px #ffd23f;
  animation: px-floaty2 8s ease-in-out infinite;
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

/* ── section label ── */
.px-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #2c2a4a;
  margin-bottom: 14px;
}

/* ── segmented toggle ── */
.seg-toggle {
  display: flex;
  border: 4px solid #2c2a4a;
  box-shadow: 4px 4px 0 #2c2a4a;
  margin-bottom: 30px;
}

.seg-divider {
  width: 4px;
  background: #2c2a4a;
}

.seg-btn {
  flex: 1;
  padding: 17px 8px 14px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 13px;
  color: #2c2a4a;
  background: #fffdf5;
  cursor: pointer;
  user-select: none;
}

.seg-btn.active.seg-green  { background: #54c46a; color: #fff; text-shadow: 2px 2px 0 #2c2a4a; }
.seg-btn.active.seg-blue   { background: #46b6e8; color: #fff; text-shadow: 2px 2px 0 #2c2a4a; }
.seg-btn.active.seg-purple { background: #9d7be0; color: #fff; text-shadow: 2px 2px 0 #2c2a4a; }

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
