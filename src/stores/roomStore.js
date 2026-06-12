import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from './settingsStore.js'
import { ref as dbRef, set as dbSet } from 'firebase/database'
import { db } from '../firebase/firebase.js'
import { ABANDONED_GRACE_MS } from '../core/constants.js'


import {
  createRoom as rtdbCreateRoom,
  findAndClaimSlot,
  setSlotReady,
  setRoomStatus,
  getRoomOnce,
  subscribeToRoom,
  unsubscribeRoom,
  setHostDisconnect,
  cancelHostDisconnect
} from '../firebase/roomService.js'
import {
  getOrCreatePlayerId,
  generateRoomId,
  saveRoomSession,
  getRoomSession,
  clearRoomSession
} from '../utils/identity.js'
import { FirebaseGameService } from '../services/FirebaseGameService.js'

export const useRoomStore = defineStore('room', () => {
  const router = useRouter()
  const settings = useSettingsStore()

  const roomId = ref(null)
  const myPlayerId = ref(getOrCreatePlayerId())
  const mySlotIndex = ref(null)
  const slots = ref([])
  const roomStatus = ref(null)
  const playerCount = ref(2)
  const error = ref(null)
  let _roomRef = null
  let _gameStarting = false
  let _abandonedTimer = null


  const isHost = computed(() => {
    return slots.value[0]?.playerId === myPlayerId.value
  })

  const allSlotsFilled = computed(() => {
    if (!slots.value.length) return false
    return slots.value.every(s => s.playerId != null)
  })

  const allSlotsReady = computed(() => {
    if (!slots.value.length) return false
    return slots.value.every(s => s.playerId != null && s.ready)
  })

  async function createRoom(count, hostPlayerData) {
    const id = generateRoomId()
    const pid = myPlayerId.value
    playerCount.value = count
    roomId.value = id

    await rtdbCreateRoom(id, pid, count, settings.gameMode)
    setHostDisconnect(id)

    const hostSlot = { playerId: pid, ...hostPlayerData, ready: false }
    await dbSet(dbRef(db, `rooms/${id}/slots/0`), hostSlot)

    mySlotIndex.value = 0
    saveRoomSession({ roomId: id, slotIndex: 0 })
    router.push(`/lobby?room=${id}`)
  }

  async function joinRoom(id, playerData) {
    roomId.value = id
    myPlayerId.value = getOrCreatePlayerId()
    try {
      const slotIdx = await findAndClaimSlot(id, { playerId: myPlayerId.value, ...playerData })
      mySlotIndex.value = slotIdx
      saveRoomSession({ roomId: id, slotIndex: slotIdx })
    } catch (e) {
      if (e.message === 'Room not found') error.value = 'roomNotFound'
      else if (e.message === 'No available slots') error.value = 'roomFull'
      else error.value = 'joinError'
      throw e
    }
  }

  async function setReady() {
    await setSlotReady(roomId.value, mySlotIndex.value, true)
  }

  function watchRoom(id) {
    stopWatching()
    _roomRef = subscribeToRoom(id, async (data) => {
      if (!data) {
        error.value = 'roomNotFound'
        stopWatching()
        return
      }

      const slotArray = data.slots
        ? Object.values(data.slots)
        : []
      slots.value = slotArray

      if (data.meta) {
        roomStatus.value = data.meta.status
        playerCount.value = data.meta.playerCount
      }

      if (data.meta?.status === 'abandoned') {
        if (isHost.value) {
          await setRoomStatus(roomId.value, 'waiting')
          setHostDisconnect(roomId.value)
          return
        }
        if (!_abandonedTimer) {
          _abandonedTimer = setTimeout(() => {
            _abandonedTimer = null
            stopWatching()
            clearRoomSession()
            error.value = 'roomAbandoned'
          }, ABANDONED_GRACE_MS)
        }
        return
      }

      if (_abandonedTimer) {
        clearTimeout(_abandonedTimer)
        _abandonedTimer = null
      }

      if (isHost.value && allSlotsReady.value && data.meta?.status !== 'playing') {
        await _startOnlineGame(data)
        return
      }

      if (data.meta?.status === 'playing' && !isHost.value) {
        window.location.href = `/ttt-6/game?room=${id}`
      }
    })
  }

  async function _startOnlineGame(roomData) {
    if (_gameStarting) return
    _gameStarting = true
    try {
      const players = Object.values(roomData.slots).map(s => ({
        id: s.playerId,
        name: s.name,
        mark: s.mark,
        color: s.color
      }))

      const gameMode = roomData.meta?.gameMode ?? 'CLASSIC'
      const fbService = new FirebaseGameService(roomId.value, myPlayerId.value, 0)
      await fbService.startGame({ players, gameMode })

      await setRoomStatus(roomId.value, 'playing')
      await cancelHostDisconnect(roomId.value)
      window.location.href = `/ttt-6/game?room=${roomId.value}`
    } finally {
      _gameStarting = false
    }
  }

  function stopWatching() {
    if (_abandonedTimer) {
      clearTimeout(_abandonedTimer)
      _abandonedTimer = null
    }
    if (_roomRef) {
      unsubscribeRoom(_roomRef)
      _roomRef = null
    }
  }

  async function restoreSession() {
    const session = getRoomSession()
    if (!session) return false

    const data = await getRoomOnce(session.roomId)
    if (!data) return false

    const slotsArray = data.slots ? Object.values(data.slots) : []

    if (data.meta?.status === 'abandoned') {
      const currentUserIsHost = slotsArray[0]?.playerId === myPlayerId.value
      if (currentUserIsHost) {
        await setRoomStatus(session.roomId, 'waiting')
        setHostDisconnect(session.roomId)
      }
    }

    roomId.value = session.roomId
    mySlotIndex.value = session.slotIndex
    slots.value = slotsArray
    if (data.meta) {
      roomStatus.value = data.meta.status === 'abandoned' ? 'waiting' : data.meta.status
      playerCount.value = data.meta.playerCount
    }
    return true
  }

  function clearError() {
    error.value = null
  }

  return {
    roomId,
    myPlayerId,
    mySlotIndex,
    slots,
    roomStatus,
    playerCount,
    error,
    isHost,
    allSlotsFilled,
    allSlotsReady,
    createRoom,
    joinRoom,
    setReady,
    watchRoom,
    stopWatching,
    restoreSession,
    clearError
  }
})
