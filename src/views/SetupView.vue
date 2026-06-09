<template>

  <LanguageSelector class="lang-pos" />

  <GameSetup @start="startGame" />

</template>

<script setup>
import { useRouter } from 'vue-router'
import GameSetup from '../components/setup/GameSetup.vue'
import { useSettingsStore } from '../stores/settingsStore.js'
import { useGameStore } from '../stores/gameStore.js'
import LanguageSelector from "@/components/LanguageSelector.vue";

const router = useRouter()
const settings = useSettingsStore()
const game = useGameStore()

function startGame() {
  game.startGame(settings.playerObjects)
  router.push('/game')
}
</script>
