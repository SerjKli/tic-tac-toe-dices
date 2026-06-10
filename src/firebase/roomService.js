import { db } from './firebase.js'
import {
  ref,
  get,
  set,
  onValue,
  off,
  runTransaction,
  onDisconnect
} from 'firebase/database'

export function createRoom(roomId, hostId, playerCount) {
  const roomRef = ref(db, `rooms/${roomId}`)
  return set(roomRef, {
    meta: {
      hostId,
      playerCount,
      createdAt: Date.now(),
      status: 'waiting'
    },
    slots: Object.fromEntries(
      Array.from({ length: playerCount }, (_, i) => [i, { playerId: null, name: '', mark: '', color: '', ready: false }])
    ),
    gameState: null
  })
}

export async function joinRoomSlot(roomId, slotIndex, playerData) {
  const slotRef = ref(db, `rooms/${roomId}/slots/${slotIndex}`)
  await set(slotRef, { ...playerData, ready: false })
  return slotIndex
}

export async function findAndClaimSlot(roomId, playerData) {
  const slotsRef = ref(db, `rooms/${roomId}/slots`)
  const snap = await get(slotsRef)
  const slots = snap.val()
  if (!slots) throw new Error('Room not found')

  for (const [i, slot] of Object.entries(slots)) {
    if (!slot.playerId) {
      const slotRef = ref(db, `rooms/${roomId}/slots/${i}`)
      let claimed = false
      await runTransaction(slotRef, (current) => {
        if (current && !current.playerId) {
          claimed = true
          return { ...playerData, ready: false }
        }
        return current
      })
      if (claimed) return Number(i)
    }
  }
  throw new Error('No available slots')
}

export function setSlotReady(roomId, slotIndex, ready) {
  const readyRef = ref(db, `rooms/${roomId}/slots/${slotIndex}/ready`)
  return set(readyRef, ready)
}

export function pushGameState(roomId, snapshot) {
  const gsRef = ref(db, `rooms/${roomId}/gameState`)
  return set(gsRef, { ...snapshot, updatedAt: Date.now() })
}

export function setRoomStatus(roomId, status) {
  const statusRef = ref(db, `rooms/${roomId}/meta/status`)
  return set(statusRef, status)
}

export async function getRoomOnce(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}`))
  return snap.val()
}

export function subscribeToRoom(roomId, cb) {
  const roomRef = ref(db, `rooms/${roomId}`)
  onValue(roomRef, (snap) => cb(snap.val()))
  return roomRef
}

export function unsubscribeRoom(roomRef) {
  off(roomRef)
}

export function setHostDisconnect(roomId) {
  const statusRef = ref(db, `rooms/${roomId}/meta/status`)
  onDisconnect(statusRef).set('abandoned')
}

export function pushPlayerEmoji(roomId, playerId, emoji) {
  return set(ref(db, `rooms/${roomId}/playerEmojis/${playerId}`), emoji)
}

export function subscribeToPlayerEmojis(roomId, cb) {
  const emojisRef = ref(db, `rooms/${roomId}/playerEmojis`)
  onValue(emojisRef, snap => cb(snap.val()))
  return emojisRef
}
