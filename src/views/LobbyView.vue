<template>
  <ViewWrapper class="lobby-view">

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
              <Mark :mark="m" />
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
          <button class="action-btn btn-xs" :class="{ 'btn-success':copied }" @click="copyLink">
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
            <span v-if="slot.playerId" class="slot-mark" :style="{ color: slot.color }">
              <Mark :mark="slot.mark" />
            </span>
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
  </ViewWrapper>
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
import ViewWrapper from '@/components/ViewWrapper.vue'
import Mark from "@/components/game/Mark.vue";

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



</style>
