<template>
  <div class="game-view">
    <div class="game-layout">
      <aside class="sidebar">
<!--        <PlayerInfo v-if="game.state.currentPlayer" :player="game.state.currentPlayer" />-->
        <DiceRoller
          :roll="game.state.lastRoll"
          :canRoll="game.isRolling && game.myTurn"
          @roll="handleRoll"
        />
      </aside>

      <main class="board-area">
        <PlayerStrip
          v-if="game.state.players?.length"
          :players="game.state.players"
          :currentPlayerId="game.state.currentPlayer?.id"
          :playerEmojis="chat.playerEmojis"
        />
        <GameBoard
          v-if="game.state.board"
          :board="game.state.board"
          :players="game.state.players"
          :isCandidateCell="game.isCandidateCell"
          :getCandidateAction="game.getCandidateAction"
          :winCells="game.state.winCells"
          @cell-click="handleCellClick($event)"
        />
        <p v-if="isDoubles && game.myTurn" class="doubles-notice">{{ t('game.doubles') }}</p>

        <template v-if="game.myTurn || !game.isOnline">
          <template v-if="game.canSkip">
            <p class="hint">{{ t('game.allCellsOwned') }}</p>
            <button class="skip-btn" @click="game.skipTurn()">{{ t('game.skipTurn') }}</button>
          </template>
          <p v-else-if="game.isChoosing" class="hint">{{ t('game.chooseCell') }}</p>
          <p v-if="game.isRolling" class="hint">{{ t('game.rollPrompt') }}</p>
        </template>

        <div v-if="game.isOnline && !game.myTurn && !game.isOver" class="waiting-overlay">
          <p class="waiting-msg">{{ t('game.waitingForPlayer', { name: game.state.currentPlayer?.name ?? '…' }) }}</p>
        </div>
      </main>
    </div>

    <br><br>
    <div class="text-center">
      <ExitButton />
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
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/gameStore.js'
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
import FloatingRollDiceButton from "@/components/game/FloatingRollDiceButton.vue";

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
