<template>
  <div class="game-view">
    <PlayerStrip
        v-if="game.state.players?.length"
        :players="game.state.players"
        :currentPlayerId="game.state.currentPlayer?.id"
        :playerEmojis="chat.playerEmojis"
    />
    <br>

    <div class="game-layout">
      <aside class="sidebar"  v-if="game.isAdvanced && (game.myTurn || game.isOnline)">
        <CardHand v-if="game.isAdvanced && !game.isOver" />
      </aside>

      <main class="board-area">

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

        <div class="status-line">
          <div class="status-message">
            <p v-if="isDoubles && game.myTurn" class="doubles-notice">{{ t('game.doubles') }}</p>

            <p v-if="card.boardTargetCardId" class="hint shield-target-hint">{{ t('cards.shieldClickCell') }}</p>

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
          </div>
          <ExitButton />
        </div>

      </main>
    </div>



    <WinBanner
      v-if="game.isOver && game.state.winnerPlayer"
      :winner="game.state.winnerPlayer"
      @play-again="playAgain"
    />

    <EmojiPicker v-if="game.state.players?.length" @send="handleEmojiSend" />
    <CardErrorToast />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/gameStore.js'
import { useCardStore } from '../stores/cardStore.js'
import { TurnAction } from '../core/constants.js'
import { useRoomStore } from '../stores/roomStore.js'
import { useChatStore } from '../stores/chatStore.js'
import GameBoard from '../components/game/Board/GameBoard.vue'
import PlayerStrip from '../components/game/Player/PlayerStrip.vue'
import WinBanner from '../components/game/WinBanner.vue'
import ExitButton from '../components/game/ExitButton.vue'
import EmojiPicker from '../components/game/Chat/EmojiPicker.vue'
import CardHand from '@/components/game/Cards/CardHand.vue'
import BoardActionOverlay from '@/components/game/Board/BoardOverlay/BoardActionOverlay.vue'
import CardErrorToast from '@/components/game/Cards/CardErrorToast.vue'

const router = useRouter()
const route = useRoute()
const game = useGameStore()
const card = useCardStore()
const room = useRoomStore()
const chat = useChatStore()
const { t } = useI18n()

const onlineRoomId = computed(() => route.query.room ?? null)

const myPlayerId = computed(() =>
  game.isOnline ? room.myPlayerId : game.state.currentPlayer?.id ?? null
)

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
  if (card.boardTargetCardId) {
    card.useCard(card.boardTargetCardId, { row: event.row, col: event.col })
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
  if (card.boardTargetCardId) return null
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
</style>
