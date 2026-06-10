import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ref as dbRef, set as dbSet } from 'firebase/database'
import { db } from '../firebase/firebase.js'
import {
  createRoom as rtdbCreateRoom,
  findAndClaimSlot,
  setSlotReady,
  setRoomStatus,
  getRoomOnce,
  subscribeToRoom,
  unsubscribeRoom,
  setHostDisconnect
} from '../firebase/roomService.js'
import {
  getOrCreatePlayerId,
  generateRoomId,
  saveRoomSession,
  getRoomSession
} from '../utils/identity.js'
import { FirebaseGameService } from '../services/FirebaseGameService.js'

export const useRoomStore = defineStore('room', () => {
  const router = useRouter()

  const roomId = ref(null)
  const myPlayerId = ref(getOrCreatePlayerId())
  const mySlotIndex = ref(null)
  const slots = ref([])
  const roomStatus = ref(null)
  const playerCount = ref(2)
  let _roomRef = null

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

    await rtdbCreateRoom(id, pid, count)
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
    const slotIdx = await findAndClaimSlot(id, { playerId: myPlayerId.value, ...playerData })
    mySlotIndex.value = slotIdx
    saveRoomSession({ roomId: id, slotIndex: slotIdx })
  }

  async function setReady() {
    await setSlotReady(roomId.value, mySlotIndex.value, true)
  }

  function watchRoom(id) {
    stopWatching()
    _roomRef = subscribeToRoom(id, async (data) => {
      if (!data) return

      const slotArray = data.slots
        ? Object.values(data.slots)
        : []
      slots.value = slotArray

      if (data.meta) {
        roomStatus.value = data.meta.status
        playerCount.value = data.meta.playerCount
      }

      if (data.meta?.status === 'abandoned') {
        stopWatching()
        router.push('/')
        return
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
    const players = Object.values(roomData.slots).map(s => ({
      id: s.playerId,
      name: s.name,
      mark: s.mark,
      color: s.color
    }))

    const fbService = new FirebaseGameService(roomId.value, myPlayerId.value, 0)
    await fbService.startGame({ players })

    await setRoomStatus(roomId.value, 'playing')
    window.location.href = `/ttt-6/game?room=${roomId.value}`
  }

  function stopWatching() {
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

    roomId.value = session.roomId
    mySlotIndex.value = session.slotIndex
    if (data.slots) slots.value = Object.values(data.slots)
    if (data.meta) {
      roomStatus.value = data.meta.status
      playerCount.value = data.meta.playerCount
    }
    return true
  }

  return {
    roomId,
    myPlayerId,
    mySlotIndex,
    slots,
    roomStatus,
    playerCount,
    isHost,
    allSlotsFilled,
    allSlotsReady,
    createRoom,
    joinRoom,
    setReady,
    watchRoom,
    stopWatching,
    restoreSession
  }
})
