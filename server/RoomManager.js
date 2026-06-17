export class RoomManager {
  constructor() {
    this.rooms = new Map()           // roomId → roomData
    this.roomSubs = new Map()        // roomId → Set<ws>
    this.gameStateSubs = new Map()   // roomId → Set<ws>
    this.emojiSubs = new Map()       // roomId → Set<ws>
    this.hostRegistry = new Map()    // ws → roomId
  }

  createRoom(roomId, hostId, playerCount, gameMode = 'CLASSIC') {
    const slots = {}
    for (let i = 0; i < playerCount; i++) {
      slots[i] = { playerId: null, name: '', mark: '', color: '', ready: false }
    }
    this.rooms.set(roomId, {
      meta: { hostId, playerCount, gameMode, createdAt: Date.now(), status: 'waiting' },
      slots,
      gameState: null,
      playerEmojis: {}
    })
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) ?? null
  }

  joinSlot(roomId, slotIndex, playerData) {
    const room = this._requireRoom(roomId)
    room.slots[slotIndex] = { ...playerData, ready: false }
  }

  findAndClaimSlot(roomId, playerData) {
    const room = this._requireRoom(roomId)
    for (const [i, slot] of Object.entries(room.slots)) {
      if (!slot.playerId) {
        room.slots[i] = { ...playerData, ready: false }
        return Number(i)
      }
    }
    throw new Error('No available slots')
  }

  setSlotReady(roomId, slotIndex, ready) {
    const room = this._requireRoom(roomId)
    if (room.slots[slotIndex]) room.slots[slotIndex].ready = ready
  }

  setGameState(roomId, snapshot) {
    const room = this._requireRoom(roomId)
    room.gameState = { ...snapshot, updatedAt: Date.now() }
  }

  setStatus(roomId, status) {
    const room = this._requireRoom(roomId)
    room.meta.status = status
  }

  pushEmoji(roomId, playerId, emoji) {
    const room = this._requireRoom(roomId)
    room.playerEmojis[playerId] = emoji
  }

  // --- Subscription management ---

  subscribe(map, roomId, ws) {
    if (!map.has(roomId)) map.set(roomId, new Set())
    map.get(roomId).add(ws)
  }

  unsubscribe(map, roomId, ws) {
    map.get(roomId)?.delete(ws)
  }

  broadcast(ws, payload) {
    if (ws.readyState === 1) ws.send(JSON.stringify(payload))
  }

  broadcastToSubs(map, roomId, payload) {
    const subs = map.get(roomId)
    if (!subs) return
    const msg = JSON.stringify(payload)
    for (const ws of subs) {
      if (ws.readyState === 1) ws.send(msg)
    }
  }

  broadcastRoomUpdate(roomId) {
    this.broadcastToSubs(this.roomSubs, roomId, {
      type: 'ROOM_UPDATE', roomId, data: this.getRoom(roomId)
    })
  }

  broadcastGameStateUpdate(roomId) {
    const room = this.getRoom(roomId)
    if (!room?.gameState) return
    this.broadcastToSubs(this.gameStateSubs, roomId, {
      type: 'GAMESTATE_UPDATE', roomId, data: room.gameState
    })
  }

  broadcastEmojiUpdate(roomId) {
    const room = this.getRoom(roomId)
    this.broadcastToSubs(this.emojiSubs, roomId, {
      type: 'EMOJIS_UPDATE', roomId, data: room?.playerEmojis ?? {}
    })
  }

  registerHostDisconnect(roomId, ws) {
    this.hostRegistry.set(ws, roomId)
  }

  cancelHostDisconnect(ws, roomId) {
    if (this.hostRegistry.get(ws) === roomId) this.hostRegistry.delete(ws)
  }

  handleClientDisconnect(ws) {
    // Clean up subscriptions
    for (const subs of this.roomSubs.values()) subs.delete(ws)
    for (const subs of this.gameStateSubs.values()) subs.delete(ws)
    for (const subs of this.emojiSubs.values()) subs.delete(ws)

    // Handle host disconnect
    const roomId = this.hostRegistry.get(ws)
    if (roomId) {
      this.hostRegistry.delete(ws)
      const room = this.rooms.get(roomId)
      if (room && room.meta.status !== 'finished' && room.meta.status !== 'abandoned') {
        room.meta.status = 'abandoned'
        this.broadcastRoomUpdate(roomId)
      }
    }
  }

  _requireRoom(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')
    return room
  }
}
