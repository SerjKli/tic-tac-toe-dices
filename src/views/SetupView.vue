<template>
  <LanguageSelector class="lang-pos" />
  <GameSetup @start="startGame" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import GameSetup from '../components/setup/GameSetup.vue'
import { useSettingsStore } from '../stores/settingsStore.js'
import { useGameStore } from '../stores/gameStore.js'
import { useRoomStore } from '../stores/roomStore.js'
import LanguageSelector from '@/components/LanguageSelector.vue'

const router = useRouter()
const settings = useSettingsStore()
const game = useGameStore()
const room = useRoomStore()

async function startGame({ mode }) {
  if (mode === 'online') {
    const hostPlayer = settings.players[0]
    await room.createRoom(settings.playerCount, {
      playerId: room.myPlayerId,
      name: hostPlayer.name,
      mark: hostPlayer.mark,
      color: hostPlayer.color
    })
  } else {
    game.startGame(settings.playerObjects)
    router.push('/game')
  }
}
</script>
