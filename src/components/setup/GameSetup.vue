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
</style>
