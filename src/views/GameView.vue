<template>
  <div class="game-view">
    <div class="game-layout">
      <aside class="sidebar">
        <PlayerInfo v-if="game.state.currentPlayer" :player="game.state.currentPlayer" />
        <DiceRoller
          :roll="game.state.lastRoll"
          :canRoll="game.isRolling"
          @roll="game.rollDice()"
        />
        <ScoreBoard
          v-if="game.state.board"
          :players="game.state.players"
          :board="game.state.board"
          :currentPlayerId="game.state.currentPlayer?.id"
        />

      </aside>

      <main class="board-area">
        <GameBoard
          v-if="game.state.board"
          :board="game.state.board"
          :players="game.state.players"
          :isCandidateCell="game.isCandidateCell"
          :getCandidateAction="game.getCandidateAction"
          :winCells="game.state.winCells"
          @cell-click="game.isChoosing && game.makeMove($event)"
        />
        <template v-if="game.canSkip">
          <p class="hint">{{ t('game.allCellsOwned') }}</p>
          <button class="skip-btn" @click="game.skipTurn()">{{ t('game.skipTurn') }}</button>
        </template>
        <p v-else-if="game.isChoosing" class="hint">{{ t('game.chooseCell') }}</p>
        <p v-if="game.isRolling" class="hint">{{ t('game.rollPrompt') }}</p>
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
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/gameStore.js'
import GameBoard from '../components/game/GameBoard.vue'
import DiceRoller from '../components/game/DiceRoller.vue'
import PlayerInfo from '../components/game/PlayerInfo.vue'
import ScoreBoard from '../components/game/ScoreBoard.vue'
import WinBanner from '../components/game/WinBanner.vue'
import ExitButton from '../components/game/ExitButton.vue'

const router = useRouter()
const game = useGameStore()
const { t } = useI18n()

function playAgain() {
  game.resetGame()
  router.push('/setup')
}
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  padding: 24px 16px;
}

.game-layout {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: 32px;
  align-items: flex-start;
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

@media (max-width: 600px) {
  .game-layout {
    flex-direction: column;
  }

  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    min-width: unset;
  }
}
</style>
