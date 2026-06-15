<template>
  <div class="lobby-view">

    <LanguageSelector class="lang-pos" />

    <div v-if="room.error" class="error-banner">
      <span>{{ errorMessage }}</span>
      <button class="error-close" @click="room.clearError()">✕</button>
    </div>

    <!-- Guest setup form (shown before joining) -->
    <div v-if="showGuestForm" class="px-card">
      <div class="px-header" style="background: #2c2a4a">
        <h2 class="px-player-label">{{ t('lobby.joinRoom') }}</h2>
        <button class="action-btn" @click="randomizeGuest">🎲 {{ t('setup.randomize') }}</button>
      </div>
      <div class="px-body">
        <div>
          <label class="px-field-label">{{ t('setup.name') }}</label>
          <input class="px-input" v-model="guestName" type="text" maxlength="20" />
        </div>

        <div>
          <label class="px-field-label">{{ t('setup.mark') }}</label>
          <div class="marks-grid">
            <button
                v-for="m in DEFAULT_MARKS"
                :key="m"
                class="mark-tile"
                :class="{taken: takenMarks.includes(m) }"
                :disabled="takenMarks.includes(m)"
                @click="guestMark = m"
            >
              {{ m }}
              <span v-if="guestMark === m" class="mark-sel-ring"></span>
            </button>
          </div>
        </div>

       <div>
         <label class="px-field-label">{{ t('setup.color') }}</label>
         <div class="colors-grid">
           <button
               v-for="c in DEFAULT_COLORS"
               :key="c"
               class="color-swatch"
               :class="{ taken: takenColors.includes(c) }"
               :style="{ background: c }"
               :disabled="takenColors.includes(c)"
               @click="guestColor = c"
           >
             <span v-if="guestColor === c" class="color-sel-ring"></span>
           </button>
         </div>
       </div>

        <br>
       <p class="text-center">
         <button class="action-btn btn-success" :disabled="!guestName.trim()" @click="submitJoin">
           {{ t('lobby.joinRoom') }}
         </button>
       </p>
      </div>
    </div>

    <!-- Lobby (shown after joining) -->
    <div v-else class="px-card">
      <div class="px-header" style="background: #2c2a4a">
        <h2 class="px-player-label">{{ t('lobby.roomCode') }}</h2>
      </div>
      <div class="px-body">
        <div class="room-code-row">
          <span class="room-code">{{ room.roomId }}</span>
          <button class="action-btn" :class="{ 'btn-success':copied }" @click="copyLink">
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

        <br>
        <button
            v-if="!mySlotReady"
            class="action-btn btn-success"
            :disabled="!room.allSlotsFilled"
            @click="markReady"
        >
          {{ t('lobby.markReady') }}
        </button>

        <p v-else class="ready-msg">{{ t('lobby.youAreReady') }}</p>
      </div>
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
  if (room.error === 'roomAbandoned') return t('lobby.errorRoomAbandoned')
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
  gap: 16px;
  background: linear-gradient(#aee6ff 0%, #cdf3ff 45%, #dff7e6 100%);
  font-family: 'VT323', monospace;
  position: relative;
  overflow-x: hidden;
}

/* pixel scenery */
.lobby-view::before,
.lobby-view::after {
  content: '';
  position: absolute;
  pointer-events: none;
}


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
  padding: 10px 12px;
  background: #fffdf5;
  border: 3px solid #2c2a4a;
  box-shadow: var(--px-shadow-sm);
  transition: border-color 0.1s, box-shadow 0.1s;
}

.slot.mine { border-color: #54c46a; box-shadow: 2px 2px 0 #54c46a; }
.slot.empty { opacity: 0.45; }

.slot-mark {
  font-size: 1.4rem;
  min-width: 32px;
  text-align: center;
}

.empty-mark { color: #bbb; }

.slot-name {
  flex: 1;
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #2c2a4a;
}

.ready-badge {
  background: #54c46a;
  color: #fffdf5;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 3px 7px 2px;
  border: 2px solid #2c2a4a;
  box-shadow: 1px 1px 0 #2c2a4a;
  text-shadow: 1px 1px 0 #2f8f44;
}

.waiting-msg, .hint {
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #7d7a96;
  margin: 0;
}

.ready-msg {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #54c46a;
  text-align: center;
  text-shadow: 1px 1px 0 #2f8f44;
}


.lang-pos {
  position: fixed;
  top: 16px;
  right: 16px;
}

.error-banner {
  width: 100%;
  max-width: 480px;
  background: #fffdf5;
  border: 3px solid #ef4444;
  box-shadow: 2px 2px 0 #ef4444;
  color: #ef4444;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-banner span {
  flex: 1;
  font-family: 'VT323', monospace;
  font-size: 20px;
}

.error-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  font-size: 1.2rem;
  padding: 0 4px;
  line-height: 1;
  font-family: 'Press Start 2P', monospace;
}
</style>
