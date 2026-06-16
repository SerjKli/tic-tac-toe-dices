<template>
  <Transition name="card-used">
      <div class="card-used-overlay" v-if="cardUsed.visible.value">
        <div class="card-used-badge" >
          <CardItem :card="cardDef" :animation="false"/>
        </div>
        <div class="card-used-player" v-if="cardUsed.player.value">
          <Mark :mark="cardUsed.player.value.mark" :style="{ color: cardUsed.player.value.color }" />
          <span class="player-name">{{ cardUsed.player.value.name }}</span>
        </div>
      </div>
  </Transition>
</template>

<script setup>
import {computed, watch} from 'vue'
import { useCardUsed } from '@/composables/useCardUsed.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useMessageStore } from '@/stores/messageStore.js'
import { CARDS } from '@/core/cards.js'
import Mark from "@/components/game/Mark.vue";
import CardItem from "@/components/game/Cards/CardItem.vue";

const cardUsed = useCardUsed()
const game = useGameStore()
const messageStore = useMessageStore()

const cardDef = computed(() => cardUsed.cardId.value ? CARDS[cardUsed.cardId.value] : null)

watch(cardUsed.visible, (isVisible) => {
  if (!isVisible) return
  const msgKey = cardDef.value?.receivedMsgKey
  if (!msgKey) return
  if (cardUsed.targetPlayerId.value !== game.myPlayerId) return
  messageStore.showMessage(msgKey, 'error')
})
</script>

<style scoped>

</style>
