export {
  createRoom,
  joinRoomSlot,
  findAndClaimSlot,
  setSlotReady,
  pushGameState,
  setRoomStatus,
  getRoomOnce,
  subscribeToRoom,
  unsubscribeRoom,
  setHostDisconnect,
  cancelHostDisconnect,
  pushPlayerEmoji,
  subscribeToPlayerEmojis
} from '../firebase/roomService.js'

export { off as unsubscribePlayerEmojis } from 'firebase/database'

import { db } from '../firebase/firebase.js'
import { ref, onValue, off } from 'firebase/database'

export function subscribeToGameState(roomId, cb) {
  const gsRef = ref(db, `rooms/${roomId}/gameState`)
  onValue(gsRef, (snap) => { if (snap.val()) cb(snap.val()) })
  return gsRef
}

export function unsubscribeGameState(gsRef) {
  off(gsRef)
}
