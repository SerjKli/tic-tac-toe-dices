const PLAYER_ID_KEY = 'tic-toe:playerId'
const ROOM_SESSION_KEY = 'tic-toe:roomSession'

export function getOrCreatePlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

export function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function saveRoomSession({ roomId, slotIndex }) {
  localStorage.setItem(ROOM_SESSION_KEY, JSON.stringify({ roomId, slotIndex }))
}

export function getRoomSession() {
  try {
    const raw = localStorage.getItem(ROOM_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearRoomSession() {
  localStorage.removeItem(ROOM_SESSION_KEY)
}
