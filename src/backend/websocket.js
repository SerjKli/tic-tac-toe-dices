const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080'

let ws = null
let wsReady = false
const pending = new Map()      // reqId → { resolve, reject, timer }
const roomSubs = new Map()     // roomId → Set<cb>
const gameStateSubs = new Map()
const emojiSubs = new Map()
let queue = []                 // raw JSON strings queued before connect

function handleIncoming(msg) {
  if (msg.type === 'ACK') {
    const p = pending.get(msg.reqId)
    if (p) {
      clearTimeout(p.timer)
      pending.delete(msg.reqId)
      msg.ok ? p.resolve(msg.result) : p.reject(new Error(msg.error))
    }
    return
  }
  if (msg.type === 'ROOM_UPDATE') {
    roomSubs.get(msg.roomId)?.forEach(cb => cb(msg.data))
  }
  if (msg.type === 'GAMESTATE_UPDATE') {
    if (msg.data) gameStateSubs.get(msg.roomId)?.forEach(cb => cb(msg.data))
  }
  if (msg.type === 'EMOJIS_UPDATE') {
    emojiSubs.get(msg.roomId)?.forEach(cb => cb(msg.data))
  }
}

function flushQueue() {
  const msgs = queue.splice(0)
  for (const msg of msgs) ws.send(msg)
}

function resubscribeAll() {
  for (const roomId of roomSubs.keys()) _rawSend('SUBSCRIBE_ROOM', { roomId })
  for (const roomId of gameStateSubs.keys()) _rawSend('SUBSCRIBE_GAMESTATE', { roomId })
  for (const roomId of emojiSubs.keys()) _rawSend('SUBSCRIBE_EMOJIS', { roomId })
}

function _rawSend(type, data) {
  const msg = JSON.stringify({ type, ...data })
  if (wsReady) ws.send(msg)
  else queue.push(msg)
}

function ensureConnected() {
  if (ws && ws.readyState !== WebSocket.CLOSED) return

  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    wsReady = true
    resubscribeAll()
    flushQueue()
  }

  ws.onmessage = ({ data }) => handleIncoming(JSON.parse(data))

  ws.onclose = () => {
    wsReady = false
    setTimeout(ensureConnected, 2000)
  }
}

function send(type, data = {}) {
  ensureConnected()
  return new Promise((resolve, reject) => {
    const reqId = crypto.randomUUID()
    const timer = setTimeout(() => {
      pending.delete(reqId)
      reject(new Error(`WS timeout: ${type}`))
    }, 10000)
    pending.set(reqId, { resolve, reject, timer })
    const msg = JSON.stringify({ type, reqId, ...data })
    if (wsReady) ws.send(msg)
    else queue.push(msg)
  })
}

function addSub(map, roomId, cb) {
  if (!map.has(roomId)) map.set(roomId, new Set())
  map.get(roomId).add(cb)
}

function removeSub(map, roomId, cb) {
  const set = map.get(roomId)
  if (!set) return false
  set.delete(cb)
  if (set.size === 0) { map.delete(roomId); return true }
  return false
}

// --- Public API ---

export function createRoom(roomId, hostId, playerCount, gameMode = 'CLASSIC') {
  return send('CREATE_ROOM', { roomId, hostId, playerCount, gameMode })
}

export async function joinRoomSlot(roomId, slotIndex, playerData) {
  await send('JOIN_SLOT', { roomId, slotIndex, playerData })
  return slotIndex
}

export async function findAndClaimSlot(roomId, playerData) {
  return send('FIND_CLAIM_SLOT', { roomId, playerData })
}

export function setSlotReady(roomId, slotIndex, ready) {
  return send('SET_SLOT_READY', { roomId, slotIndex, ready })
}

export function pushGameState(roomId, snapshot) {
  return send('PUSH_GAME_STATE', { roomId, snapshot })
}

export function setRoomStatus(roomId, status) {
  return send('SET_ROOM_STATUS', { roomId, status })
}

export function getRoomOnce(roomId) {
  return send('GET_ROOM', { roomId })
}

export function subscribeToRoom(roomId, cb) {
  addSub(roomSubs, roomId, cb)
  send('SUBSCRIBE_ROOM', { roomId })
  return { roomId, cb, _type: 'room' }
}

export function unsubscribeRoom(ref) {
  if (!ref) return
  const empty = removeSub(roomSubs, ref.roomId, ref.cb)
  if (empty) send('UNSUBSCRIBE_ROOM', { roomId: ref.roomId })
}

export function setHostDisconnect(roomId) {
  send('SET_HOST_DISCONNECT', { roomId })
}

export function cancelHostDisconnect(roomId) {
  return send('CANCEL_HOST_DISCONNECT', { roomId })
}

export function pushPlayerEmoji(roomId, playerId, emoji) {
  return send('PUSH_EMOJI', { roomId, playerId, emoji })
}

export function subscribeToPlayerEmojis(roomId, cb) {
  addSub(emojiSubs, roomId, cb)
  send('SUBSCRIBE_EMOJIS', { roomId })
  return { roomId, cb, _type: 'emojis' }
}

export function unsubscribePlayerEmojis(ref) {
  if (!ref) return
  const empty = removeSub(emojiSubs, ref.roomId, ref.cb)
  if (empty) send('UNSUBSCRIBE_EMOJIS', { roomId: ref.roomId })
}

export function subscribeToGameState(roomId, cb) {
  addSub(gameStateSubs, roomId, cb)
  send('SUBSCRIBE_GAMESTATE', { roomId })
  return { roomId, cb, _type: 'gameState' }
}

export function unsubscribeGameState(ref) {
  if (!ref) return
  const empty = removeSub(gameStateSubs, ref.roomId, ref.cb)
  if (empty) send('UNSUBSCRIBE_GAMESTATE', { roomId: ref.roomId })
}
