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
import { useI18n } from 'vue-i18n'
import { useCardUsed } from '@/composables/useCardUsed.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useMessageStore } from '@/stores/messageStore.js'
import { CARDS } from '@/core/cards.js'
import { CardType } from '@/core/constants.js'
import Mark from "@/components/game/Mark.vue";
import CardItem from "@/components/game/Cards/CardItem.vue";

const { t } = useI18n()
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
.card-used-overlay {
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  z-index: 20;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.35));
}

.card-used-badge {
  width: 140px;
}

.card-used-player {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.92);
  padding: 4px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border: var(--px-border);
}

/* Transitions */
.card-used-enter-active {
  animation: card-used-in 650ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
  transform-origin: center;
}

.card-used-leave-active {
  animation: card-used-out 420ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
/* =========================
   ENTER ANIMATION
   ========================= */
@keyframes card-used-in {
  0% {
    opacity: 0;
    transform:
        translateX(-50%) translateY(40px)
        scale(0.4)
        rotateX(35deg)
        rotateZ(-18deg);
    filter: blur(6px);
  }

  35% {
    opacity: 1;
    transform:
        translateX(-50%) translateY(-10px)
        scale(1.15)
        rotateX(0deg)
        rotateZ(6deg);
    filter: blur(0px);
  }

  55% {
    transform:
        translateX(-50%) translateY(6px)
        scale(0.98)
        rotateZ(-3deg);
  }

  75% {
    transform:
        translateX(-50%) translateY(-3px)
        scale(1.03)
        rotateZ(2deg);
  }

  100% {
    transform:
        translateX(-50%) translateY(0)
        scale(1)
        rotateZ(0deg);
  }
}

/* =========================
   EXIT ANIMATION
   ========================= */
@keyframes card-used-out {
  0% {
    opacity: 1;
    transform:
        translateX(-50%) translateY(0)
        scale(1)
        rotateZ(0deg);
  }

  40% {
    opacity: 0.9;
    transform:
        translateX(-50%) translateY(-20px)
        scale(1.05)
        rotateZ(-6deg);
  }

  100% {
    opacity: 0;
    transform:
        translateX(-50%) translateY(-80px)
        scale(0.6)
        rotateZ(10deg);
    filter: blur(3px);
  }
}
</style>
