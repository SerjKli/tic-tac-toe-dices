<template>
  <div class="game-view">
    <div class="game-layout">
      <aside class="sidebar">
<!--        <PlayerInfo v-if="game.state.currentPlayer" :player="game.state.currentPlayer" />-->
        <CardPhasePanel
          v-if="game.isAdvanced && game.isCardPhase && (game.myTurn || !game.isOnline)"
          :selectedCardId="selectedHandCardId"
          @cancel-select="selectedHandCardId = null"
        />
        <CardHand
          v-if="game.isAdvanced && !game.isOver"
          :cards="game.myHand"
          :selectedCardId="selectedHandCardId"
          :disabled="handDisabled"
          :lockMessage="handLockMessage"
          @select="handleCardSelect"
        />
<!--        <DiceRoller-->
<!--          :roll="game.state.lastRoll"-->
<!--          :canRoll="game.isRolling && game.myTurn"-->
<!--          @roll="handleRoll"-->
<!--        />-->
      </aside>

      <main class="board-area">
        <div class="text-center">
          <ExitButton />
        </div>

        <PlayerStrip
          v-if="game.state.players?.length"
          :players="game.state.players"
          :currentPlayerId="game.state.currentPlayer?.id"
          :playerEmojis="chat.playerEmojis"
        />
        <div v-if="game.state.board" class="board-wrapper">
          <GameBoard
            :board="game.state.board"
            :players="game.state.players"
            :isCandidateCell="game.isCandidateCell"
            :getCandidateAction="game.getCandidateAction"
            :winCells="game.state.winCells"
            @cell-click="handleCellClick($event)"
          />
          <BoardActionOverlay />
        </div>
        <p v-if="isDoubles && game.myTurn" class="doubles-notice">{{ t('game.doubles') }}</p>

        <p v-if="game.boardTargetCardId" class="hint shield-target-hint">{{ t('cards.shieldClickCell') }}</p>

        <template v-if="game.myTurn || !game.isOnline">
          <template v-if="game.canSkip">
            <p class="hint">{{ t('game.allCellsOwned') }}</p>
            <button class="skip-btn" @click="game.skipTurn()">{{ t('game.skipTurn') }}</button>
          </template>
          <p v-else-if="myActionMessage" class="hint">{{ myActionMessage }}</p>
        </template>

        <div v-if="game.isOnline && !game.myTurn && !game.isOver" class="waiting-overlay">
          <p class="waiting-msg">{{ activePlayerActionMessage }}</p>
        </div>
      </main>
    </div>



    <WinBanner
      v-if="game.isOver && game.state.winnerPlayer"
      :winner="game.state.winnerPlayer"
      @play-again="playAgain"
    />

    <EmojiPicker v-if="game.state.players?.length" @send="handleEmojiSend" />

    <FloatingRollDiceButton
      :canRoll="game.isRolling && game.myTurn"
      @roll="handleRoll"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/gameStore.js'
import { TurnAction } from '../core/constants.js'
import { useRoomStore } from '../stores/roomStore.js'
import { useChatStore } from '../stores/chatStore.js'
import GameBoard from '../components/game/GameBoard.vue'
import DiceRoller from '../components/game/DiceRoller.vue'
import PlayerInfo from '../components/game/PlayerInfo.vue'
import PlayerStrip from '../components/game/PlayerStrip.vue'
import WinBanner from '../components/game/WinBanner.vue'
import ExitButton from '../components/game/ExitButton.vue'
import EmojiPicker from '../components/game/EmojiPicker.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import FloatingRollDiceButton from "@/components/game/FloatingRollDiceButton.vue"
import CardPhasePanel from '@/components/game/CardPhasePanel.vue'
import CardHand from '@/components/game/CardHand.vue'
import BoardActionOverlay from '@/components/game/BoardOverlay/BoardActionOverlay.vue'

const router = useRouter()
const route = useRoute()
const game = useGameStore()
const room = useRoomStore()
const chat = useChatStore()
const { t } = useI18n()

const onlineRoomId = computed(() => route.query.room ?? null)

const myPlayerId = computed(() =>
  game.isOnline ? room.myPlayerId : game.state.currentPlayer?.id ?? null
)

const selectedHandCardId = ref(null)

const handDisabled = computed(() =>
  !game.isCardPhase || (game.isOnline && !game.myTurn)
)

const handLockMessage = computed(() => {
  if (!game.isCardPhase) return null
  if (game.isOnline && !game.myTurn) return t('cards.notYourTurn')
  return null
})

watch(() => game.isCardPhase, (active) => {
  if (!active) selectedHandCardId.value = null
})

function handleCardSelect(cardId) {
  selectedHandCardId.value = selectedHandCardId.value === cardId ? null : cardId
}

onMounted(() => {
  if (game.isOnline) {
    game.subscribeOnline()
    if (onlineRoomId.value) chat.subscribe(onlineRoomId.value)
  }
})

function handleEmojiSend(emoji) {
  if (myPlayerId.value) chat.sendEmoji(myPlayerId.value, emoji, onlineRoomId.value)
}

function handleRoll() {
  if (game.myTurn || !game.isOnline) game.rollDice()
}

function handleCellClick(event) {
  if (game.boardTargetCardId) {
    game.useCard(game.boardTargetCardId, { row: event.row, col: event.col })
    return
  }
  if (game.isChoosing && (game.myTurn || !game.isOnline)) game.makeMove(event)
}

function playAgain() {
  game.resetGame()
  router.push('/setup')
}

onUnmounted(() => {
  room.stopWatching()
  chat.reset()
})

const isDoubles = computed(() => game.state.lastRoll && game.state.lastRoll[0] === game.state.lastRoll[1])

const myActionMessage = computed(() => {
  if (!game.currentTurnAction) return null
  if (game.canSkip) return null
  if (game.boardTargetCardId) return null
  const map = {
    [TurnAction.SELECT_CARD]: t('game.turnAction.selectCard'),
    [TurnAction.ROLL_DICE]:   t('game.turnAction.rollDice'),
    [TurnAction.SELECT_CELL]: t('game.turnAction.selectCell'),
  }
  return map[game.currentTurnAction] ?? null
})

const activePlayerActionMessage = computed(() => {
  const name = game.state.currentPlayer?.name ?? '…'
  const map = {
    [TurnAction.SELECT_CARD]: t('game.turnAction.playerSelectCard', { name }),
    [TurnAction.ROLL_DICE]:   t('game.turnAction.playerRollDice',   { name }),
    [TurnAction.SELECT_CELL]: t('game.turnAction.playerSelectCell', { name }),
  }
  return game.currentTurnAction ? map[game.currentTurnAction] : t('game.waitingForPlayer', { name })
})
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  padding: 24px 16px;
  position: relative;
}

.game-layout {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: 32px;
  align-items: center;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 220px;
}

.board-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.hint {
  color: #888;
  font-size: 0.95rem;
  margin: 0;
}

.shield-target-hint {
  color: #607D8B;
  font-weight: 600;
}

.skip-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #888;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

.skip-btn:hover {
  background: #555;
}

.board-wrapper {
  position: relative;
  border-radius: 12px;
}

.waiting-overlay {
  padding: 12px 24px;
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
  text-align: center;
}

.waiting-msg {
  color: #888;
  font-size: 0.95rem;
  margin: 0;
  font-style: italic;
}

@media (max-width: 600px) {
  .game-view {
    padding-top: 64px;
  }

  .game-layout {
    flex-direction: column;
    align-items: center;
  }

  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    min-width: unset;
    width: 100%;
    gap: 10px;
  }

  .board-area {
    width: 100%;
  }
}
</style>
