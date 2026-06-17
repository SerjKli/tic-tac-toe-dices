<template>
  <div class="win-overlay">
    <div class="px-card" :style="{ '--winner-color': winner.color }">
      <div class="px-header" :style="{ background: winner.color }">
        <div class="px-mark-tile">
          <Mark :mark="winner.mark" />
        </div>
        <h2>{{ t('game.wins', { name: winner.name }) }}</h2>
      </div>
      <div class="px-body text-center">
        <button class="action-btn btn-success" @click="$emit('play-again')">▶ {{ t('game.playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Mark from "@/components/game/Mark.vue";

defineProps({
  winner: { type: Object, required: true }
})

defineEmits(['play-again'])

const { t } = useI18n()
</script>

<style scoped>

</style>
