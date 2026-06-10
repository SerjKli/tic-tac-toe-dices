<template>
  <div class="lobby-view">

    <LanguageSelector class="lang-pos" />

    <div v-if="room.error" class="error-banner">
      <span>{{ errorMessage }}</span>
      <button class="error-close" @click="room.clearError()">✕</button>
    </div>

    <!-- Guest setup form (shown before joining) -->
    <div v-if="showGuestForm" class="guest-form card">
      <div class="guest-form-header">
        <h2>{{ t('lobby.joinRoom') }}</h2>
        <button class="randomize-btn" @click="randomizeGuest">🎲 {{ t('setup.randomize') }}</button>
      </div>
      <label>{{ t('setup.name') }}</label>
      <input v-model="guestName" type="text" maxlength="20" />

      <label>{{ t('setup.mark') }}</label>
      <div class="mark-options">
        <button
          v-for="m in DEFAULT_MARKS"
          :key="m"
          class="mark-btn"
          :class="{ active: guestMark === m, taken: takenMarks.includes(m) }"
          :disabled="takenMarks.includes(m)"
          @click="guestMark = m"
        >{{ m }}</button>
      </div>

      <label>{{ t('setup.color') }}</label>
      <div class="color-options">
        <button
          v-for="c in DEFAULT_COLORS"
          :key="c"
          class="color-btn"
          :class="{ active: guestColor === c, taken: takenColors.includes(c) }"
          :style="{ background: c }"
          :disabled="takenColors.includes(c)"
          @click="guestColor = c"
        />
      </div>

      <button class="action-btn" :disabled="!guestName.trim()" @click="submitJoin">
        {{ t('lobby.joinRoom') }}
      </button>
    </div>

    <!-- Lobby (shown after joining) -->
    <div v-else class="lobby card">
      <h2>{{ t('lobby.roomCode') }}</h2>
      <div class="room-code-row">
        <span class="room-code">{{ room.roomId }}</span>
        <button class="copy-btn" :class="{ copied }" @click="copyLink">
          {{ copied ? t('lobby.linkCopied') : t('lobby.copyLink') }}
        </button>
      </div>

      <h3>{{ t('lobby.players') }}</h3>
      <ul class="slot-list">
        <li
          v-for="(slot, i) in room.slots"
          :key="i"
          class="slot"
          :class="{ empty: !slot.playerId, mine: i === room.mySlotIndex }"
        >
          <span v-if="slot.playerId" class="slot-mark" :style="{ color: slot.color }">{{ slot.mark }}</span>
          <span v-else class="slot-mark empty-mark">?</span>
          <span class="slot-name">{{ slot.playerId ? slot.name : t('lobby.emptySlot') }}</span>
          <span v-if="slot.ready" class="ready-badge">{{ t('lobby.ready') }}</span>
        </li>
      </ul>

      <p v-if="!room.allSlotsFilled" class="waiting-msg">{{ t('lobby.waitingForPlayers') }}</p>

      <template v-if="room.isHost">
        <p v-if="room.allSlotsReady" class="hint">{{ t('lobby.allReady') }}</p>
        <p v-else-if="room.allSlotsFilled" class="hint">{{ t('lobby.waitingForReady') }}</p>
      </template>

      <button
        v-if="!mySlotReady"
        class="action-btn"
        :disabled="!room.allSlotsFilled"
        @click="markReady"
      >

        {{ t('lobby.markReady') }}
      </button>
      <p v-else class="ready-msg">{{ t('lobby.youAreReady') }}</p>
    </div>

    <ExitButton />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoomStore } from '../stores/roomStore.js'
import { useSettingsStore } from '../stores/settingsStore.js'
import { getRoomSession } from '../utils/identity.js'
import { DEFAULT_MARKS, DEFAULT_COLORS } from '../core/constants.js'
import LanguageSelector from '../components/LanguageSelector.vue'
import ExitButton from "@/components/game/ExitButton.vue";

const route = useRoute()
const { t } = useI18n()
const room = useRoomStore()
const settings = useSettingsStore()

const showGuestForm = ref(false)
const guestName = ref(settings.players.value?.[0]?.name ?? 'Player')
const guestMark = ref(settings.players.value?.[0]?.mark ?? DEFAULT_MARKS[1])
const guestColor = ref(settings.players.value?.[0]?.color ?? DEFAULT_COLORS[1])

const errorMessage = computed(() => {
  if (room.error === 'roomNotFound') return t('lobby.errorRoomNotFound')
  if (room.error === 'roomFull') return t('lobby.errorRoomFull')
  return t('lobby.errorJoin')
})

const mySlotReady = computed(() => {
  if (room.mySlotIndex == null) return false
  return room.slots[room.mySlotIndex]?.ready === true
})

const takenMarks = computed(() => room.slots.filter(s => s.playerId).map(s => s.mark))
const takenColors = computed(() => room.slots.filter(s => s.playerId).map(s => s.color))

watch(takenMarks, (taken) => {
  if (taken.includes(guestMark.value)) {
    guestMark.value = DEFAULT_MARKS.find(m => !taken.includes(m)) ?? guestMark.value
  }
})
watch(takenColors, (taken) => {
  if (taken.includes(guestColor.value)) {
    guestColor.value = DEFAULT_COLORS.find(c => !taken.includes(c)) ?? guestColor.value
  }
})

onMounted(async () => {
  const urlRoom = route.query.room
  const session = getRoomSession()

  if (urlRoom && (!session || session.roomId !== urlRoom)) {
    showGuestForm.value = true
    room.watchRoom(urlRoom)
  } else {
    const restored = await room.restoreSession()
    if (!restored && urlRoom) {
      showGuestForm.value = true
      room.watchRoom(urlRoom)
    } else {
      room.watchRoom(room.roomId ?? urlRoom)
    }
  }
})

onUnmounted(() => {
  room.stopWatching()
})

async function submitJoin() {
  const urlRoom = route.query.room
  try {
    await room.joinRoom(urlRoom, {
      name: guestName.value,
      mark: guestMark.value,
      color: guestColor.value
    })
    showGuestForm.value = false
    room.watchRoom(urlRoom)
  } catch {
    // error is set on room.error by the store
  }
}

function randomizeGuest() {
  const marks = DEFAULT_MARKS.filter(m => !takenMarks.value.includes(m))
  const colors = DEFAULT_COLORS.filter(c => !takenColors.value.includes(c))
  if (marks.length) guestMark.value = marks[Math.floor(Math.random() * marks.length)]
  if (colors.length) guestColor.value = colors[Math.floor(Math.random() * colors.length)]
}

function markReady() {
  room.setReady()
}

const copied = ref(false)

function copyLink() {
  const url = `${location.origin}/ttt-6/lobby?room=${room.roomId}`
  navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.lobby-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h2 { margin: 0; font-size: 1.5rem; }

.guest-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.randomize-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.randomize-btn:hover { background: #e0e0e0; }
h3 { margin: 0; font-size: 1.1rem; }

.room-code-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-code {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 4px;
  font-family: monospace;
}

.copy-btn {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 0.9rem;
}

.copy-btn:hover { background: #e8e8e8; }
.copy-btn.copied { background: #d4edda; border-color: #27ae60; color: #27ae60; }

.slot-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8f8f8;
  border: 2px solid transparent;
}

.slot.mine { border-color: #27ae60; }
.slot.empty { opacity: 0.5; }

.slot-mark {
  font-size: 1.4rem;
  min-width: 28px;
  text-align: center;
}

.empty-mark { color: #bbb; }

.slot-name {
  flex: 1;
  font-weight: 600;
}

.ready-badge {
  background: #27ae60;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.waiting-msg, .hint {
  color: #888;
  font-size: 0.95rem;
  margin: 0;
}

.ready-msg {
  color: #27ae60;
  font-weight: 700;
  text-align: center;
}

.action-btn {
  padding: 14px;
  font-size: 1rem;
  font-weight: 700;
  background: #27ae60;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.action-btn:hover:not(:disabled) { background: #229954; }
.action-btn:disabled { background: #aaa; cursor: not-allowed; }

label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
}

input[type="text"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.mark-options, .color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mark-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

.mark-btn.active { border-color: #27ae60; }

.mark-btn.taken {
  opacity: 0.3;
  cursor: not-allowed;
  position: relative;
}

.mark-btn.taken::after {
  content: '';
  position: absolute;
  inset: 4px;
  background: linear-gradient(45deg, transparent 45%, #999 45%, #999 55%, transparent 55%);
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
}

.color-btn.active {
  border-color: #333;
  transform: scale(1.15);
}

.color-btn.taken {
  opacity: 0.3;
  cursor: not-allowed;
  position: relative;
}

.color-btn.taken::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: linear-gradient(45deg, transparent 45%, #999 45%, #999 55%, transparent 55%);
}

.lang-pos {
  position: fixed;
  top: 16px;
  right: 16px;
}

.error-banner {
  width: 100%;
  max-width: 480px;
  background: #fdecea;
  border: 1px solid #f5c6cb;
  color: #b71c1c;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 0.95rem;
}

.error-banner span { flex: 1; }

.error-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #b71c1c;
  font-size: 1rem;
  padding: 0 4px;
  line-height: 1;
}
</style>
