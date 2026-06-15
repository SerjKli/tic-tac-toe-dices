<template>
  <div class="overlay-panel skip-turn-panel">
    <template v-if="game.canSkip">
      <div class="skip-icon">
        <span class="material-icons">skip_next</span>
      </div>
      <h3 class="skip-title">{{ t('game.allCellsOwned') }}</h3>
      <button class="overlay-btn skip-confirm-btn" @click="game.skipTurn()">
        {{ t('game.skipTurn') }}
      </button>
    </template>

    <template v-else>
      <div class="skip-icon">
        <span class="material-icons">skip_next</span>
      </div>
      <h3 class="skip-title">{{ t('skipPhase.title') }}</h3>
      <p v-if="skipCount > 1" class="skip-count">{{ t('skipPhase.skipsLeft', { n: skipCount }) }}</p>

      <template v-if="cleanseCards.length > 0">
        <p class="cleanse-hint">{{ t('skipPhase.useCleanseHint') }}</p>
        <div class="cleanse-cards">
          <CardItem
            v-for="(entry, i) in cleanseCards"
            :key="i"
            :card="CARDS[entry.cardId]"
            :card-amount="entry.count"
            @select="game.useCleanseInSkipPhase()"
          />
        </div>
      </template>

      <button class="overlay-btn skip-confirm-btn" @click="game.confirmSkipTurn()">
        {{ t('skipPhase.confirmBtn') }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore.js'
import { CARDS } from '@/core/cards.js'
import CardItem from '@/components/game/Cards/CardItem.vue'
import {CardId} from "@/core/constants.js";

const { t } = useI18n()
const game = useGameStore()

const skipCount = computed(() => game.state.currentPlayer?.skipTurnCount ?? 0)

const cleanseCards = computed(() => {
  const hand = game.state.currentPlayer?.hand ?? []
  const count = hand.filter(c => c.cardId === CardId.CLEANSE).length
  return count > 0 ? [{ cardId: CardId.CLEANSE, count }] : []
})
</script>

<style scoped>
.skip-turn-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
}

.skip-icon {
  font-size: 2rem;
  line-height: 1;
}

.skip-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
}

.skip-count {
  margin: 0;
  font-size: 0.8rem;
  color: #e74c3c;
  font-weight: 600;
}

.cleanse-hint {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #666;
  text-align: center;
  white-space: pre-line;
}

.cleanse-cards {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 2px;
}

.skip-confirm-btn {
  margin-top: 4px;
  background: #eee;
  color: #444;
  width: 100%;
}

.skip-confirm-btn:hover {
  background: #ddd;
}
</style>
