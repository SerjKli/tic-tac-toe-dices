import { WebSocketServer } from 'ws'
import { RoomManager } from './RoomManager.js'

const PORT = process.env.WS_PORT ?? 8080
const mgr = new RoomManager()
const wss = new WebSocketServer({ port: PORT })

function ack(ws, reqId, result, error) {
  const payload = error
    ? { type: 'ACK', reqId, ok: false, error: String(error) }
    : { type: 'ACK', reqId, ok: true, result: result ?? null }
  ws.send(JSON.stringify(payload))
}

function handleMessage(ws, type, reqId, payload) {
  const { roomId } = payload
  console.log('Received message', type, reqId, payload)
  switch (type) {
    case 'CREATE_ROOM':
      mgr.createRoom(roomId, payload.hostId, payload.playerCount, payload.gameMode)
      ack(ws, reqId, true)
      break

    case 'JOIN_SLOT':
      mgr.joinSlot(roomId, payload.slotIndex, payload.playerData)
      mgr.broadcastRoomUpdate(roomId)
      ack(ws, reqId, true)
      break

    case 'FIND_CLAIM_SLOT': {
      const slotIndex = mgr.findAndClaimSlot(roomId, payload.playerData)
      mgr.broadcastRoomUpdate(roomId)
      ack(ws, reqId, slotIndex)
      break
    }

    case 'SET_SLOT_READY':
      mgr.setSlotReady(roomId, payload.slotIndex, payload.ready)
      mgr.broadcastRoomUpdate(roomId)
      ack(ws, reqId, true)
      break

    case 'PUSH_GAME_STATE':
      mgr.setGameState(roomId, payload.snapshot)
      mgr.broadcastRoomUpdate(roomId)
      mgr.broadcastGameStateUpdate(roomId)
      ack(ws, reqId, true)
      break

    case 'SET_ROOM_STATUS':
      mgr.setStatus(roomId, payload.status)
      mgr.broadcastRoomUpdate(roomId)
      ack(ws, reqId, true)
      break

    case 'GET_ROOM':
      ack(ws, reqId, mgr.getRoom(roomId))
      break

    case 'SUBSCRIBE_ROOM':
      mgr.subscribe(mgr.roomSubs, roomId, ws)
      mgr.broadcast(ws, { type: 'ROOM_UPDATE', roomId, data: mgr.getRoom(roomId) })
      ack(ws, reqId, true)
      break

    case 'UNSUBSCRIBE_ROOM':
      mgr.unsubscribe(mgr.roomSubs, roomId, ws)
      ack(ws, reqId, true)
      break

    case 'SUBSCRIBE_GAMESTATE': {
      mgr.subscribe(mgr.gameStateSubs, roomId, ws)
      const room = mgr.getRoom(roomId)
      if (room?.gameState) {
        mgr.broadcast(ws, { type: 'GAMESTATE_UPDATE', roomId, data: room.gameState })
      }
      ack(ws, reqId, true)
      break
    }

    case 'UNSUBSCRIBE_GAMESTATE':
      mgr.unsubscribe(mgr.gameStateSubs, roomId, ws)
      ack(ws, reqId, true)
      break

    case 'SET_HOST_DISCONNECT':
      mgr.registerHostDisconnect(roomId, ws)
      ack(ws, reqId, true)
      break

    case 'CANCEL_HOST_DISCONNECT':
      mgr.cancelHostDisconnect(ws, roomId)
      ack(ws, reqId, true)
      break

    case 'PUSH_EMOJI':
      mgr.pushEmoji(roomId, payload.playerId, payload.emoji)
      mgr.broadcastEmojiUpdate(roomId)
      ack(ws, reqId, true)
      break

    case 'SUBSCRIBE_EMOJIS': {
      mgr.subscribe(mgr.emojiSubs, roomId, ws)
      const emojis = mgr.getRoom(roomId)?.playerEmojis ?? {}
      mgr.broadcast(ws, { type: 'EMOJIS_UPDATE', roomId, data: emojis })
      ack(ws, reqId, true)
      break
    }

    case 'UNSUBSCRIBE_EMOJIS':
      mgr.unsubscribe(mgr.emojiSubs, roomId, ws)
      ack(ws, reqId, true)
      break

    default:
      ack(ws, reqId, null, `Unknown message type: ${type}`)
  }
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }
    const { type, reqId, ...payload } = msg
    try {
      handleMessage(ws, type, reqId, payload)
    } catch (err) {
      ack(ws, reqId, null, err.message)
    }
  })

  ws.on('close', () => mgr.handleClientDisconnect(ws))
})

console.log(`WebSocket server listening on ws://localhost:${PORT}`)
