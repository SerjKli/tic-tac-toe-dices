<template>
  <Transition name="card-used">
      <div class="card-used-overlay" v-if="cardUsed.visible.value">
        <div class="card-used-badge" :style="{ background: cardDef?.color ?? '#666' }">
          <span class="card-used-icon">🃏</span>
          <span class="card-used-name">{{ cardDef ? t(cardDef.nameKey) : cardUsed.cardId.value }}</span>
          <span class="card-used-type" :class="`type-${cardType}`">{{ typeLabel }}</span>
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

const { t } = useI18n()
const cardUsed = useCardUsed()
const game = useGameStore()
const messageStore = useMessageStore()

const cardDef = computed(() => cardUsed.cardId.value ? CARDS[cardUsed.cardId.value] : null)

const cardType = computed(() => cardDef.value?.type?.toLowerCase() ?? '')

const typeLabel = computed(() => {
  switch (cardDef.value?.type) {
    case CardType.OFFENSIVE:  return t('cards.type.offensive')
    case CardType.DEFENSIVE:  return t('cards.type.defensive')
    case CardType.EXPANDING:  return t('cards.type.expanding')
    default: return ''
  }
})

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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 24px 10px;
  border-radius: 16px;
  color: #fff;
  min-width: 140px;
}

.card-used-icon {
  font-size: 2rem;
  line-height: 1;
}

.card-used-name {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-align: center;
}

.card-used-type {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(0,0,0,0.2);
}

.card-used-player {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.92);
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.player-mark {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Transitions */
.card-used-enter-active {
  animation: card-used-in 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.card-used-leave-active {
  animation: card-used-out 0.25s ease forwards;
}

@keyframes card-used-in {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.65);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes card-used-out {
  from {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) scale(0.9) translateY(-10px);
  }
}
</style>
