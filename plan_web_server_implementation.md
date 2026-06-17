# Plan: Custom WebSocket Backend for Online Multiplayer

## Context

The online mode is built on Firebase Realtime Database. The goal is to implement a drop-in WebSocket replacement so the backend can be swapped by a single env var (`BACKEND=websocket`) with **zero changes to game logic, stores, or views**. The game flow — lobby, room watch, turn-based sync, emoji chat, host-disconnect handling — must be identical.

---

## How Firebase is Used Today

Three files import Firebase directly (beyond roomService.js):

| File | Direct Firebase imports |
|---|---|
| `src/stores/roomStore.js` | `ref as dbRef`, `set as dbSet` from `firebase/database`; `db` from `firebase/firebase.js` — used on line 70 to write host slot 0 |
| `src/stores/chatStore.js` | `off` from `firebase/database` — used to cancel emoji subscription |
| `src/services/FirebaseGameService.js` | `db`, `ref`, `onValue`, `off` from Firebase — for the game-state subscription |

All other Firebase usage flows through `src/firebase/roomService.js` (13 exported functions).

---

## Solution: `@backend` Vite Alias

Add a `@backend` alias to `vite.config.js` that resolves to one of two files:
- `src/backend/firebase.js` (default) — re-exports roomService.js + adds 3 extra functions
- `src/backend/websocket.js` — full WebSocket client implementation

Switch with: `BACKEND=websocket npm run dev`

The 3 consumer files (`roomStore`, `chatStore`, `FirebaseGameService`) are updated to import from `@backend` instead of Firebase directly.

---

## Expanded Backend Contract (16 functions)

Same 13 from `roomService.js`, plus 3 new ones:

```
subscribeToGameState(roomId, cb) → ref   // replaces direct Firebase onValue in FirebaseGameService
unsubscribeGameState(ref)                // replaces direct Firebase off()
unsubscribePlayerEmojis(ref)             // replaces direct Firebase off() in chatStore
```

---

## Files to Create

### `src/backend/firebase.js`
Re-exports 13 functions from `../firebase/roomService.js`. Adds:
```js
export { off as unsubscribePlayerEmojis } from 'firebase/database'

export function subscribeToGameState(roomId, cb) {
  const gsRef = ref(db, `rooms/${roomId}/gameState`)
  onValue(gsRef, (snap) => { if (snap.val()) cb(snap.val()) })
  return gsRef
}
export function unsubscribeGameState(gsRef) { off(gsRef) }
```

### `src/backend/websocket.js`
Full WS client. Key design:
- Singleton `WebSocket` connection, lazy-init on first call, auto-reconnect on close
- `send(type, data)` returns a Promise, resolved by `ACK` message matched via `reqId` (UUID)
- Three subscription Maps: `roomSubs`, `gameStateSubs`, `emojiSubs` (roomId → Set\<cb\>)
- On reconnect (`ws.onopen`), re-send all active subscriptions so no callbacks are lost
- `subscribeToRoom(roomId, cb)` returns `{ roomId, cb, type }` as the opaque "ref"
- `unsubscribeRoom(ref)` removes callback; sends `UNSUBSCRIBE_ROOM` if set becomes empty
- Same pattern for `subscribeToGameState`/`subscribeToPlayerEmojis`
- `setHostDisconnect(roomId)` sends `SET_HOST_DISCONNECT` to server (fire-and-forget)
- `cancelHostDisconnect(roomId)` returns a Promise via `send()`
- WS URL: `import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080'`

### `server/RoomManager.js`
Pure Node.js in-memory room store:
- `rooms: Map<roomId, { meta, slots, gameState, playerEmojis }>`
- `roomSubs / gameStateSubs / emojiSubs: Map<roomId, Set<ws>>`
- `hostRegistry: Map<ws, roomId>` (for disconnect detection)
- `createRoom(roomId, hostId, playerCount, gameMode)` — creates with null slots
- `findAndClaimSlot(roomId, playerData)` — iterate slots, claim first where `playerId === null` (atomic since Node.js is single-threaded)
- `handleClientDisconnect(ws)` — if ws is in hostRegistry: set room status to `'abandoned'`, broadcast `ROOM_UPDATE`, clean up

### `server/index.js`
WebSocket server using the `ws` npm package (port from `process.env.WS_PORT ?? 8080`).

Handles all 16 message types. Key behavior:
- `SUBSCRIBE_ROOM`: register ws, immediately send `ROOM_UPDATE` with current room (mirrors Firebase `onValue` immediate fire)
- `SUBSCRIBE_GAMESTATE`: register ws, immediately send `GAMESTATE_UPDATE` if `room.gameState != null`
- `SUBSCRIBE_EMOJIS`: register ws, immediately send `EMOJIS_UPDATE`
- `PUSH_GAME_STATE`: update room, broadcast both `ROOM_UPDATE` AND `GAMESTATE_UPDATE`
- `SET_ROOM_STATUS`: update meta.status, broadcast `ROOM_UPDATE`
- `SET_HOST_DISCONNECT`: store `ws → roomId` in hostRegistry
- `CANCEL_HOST_DISCONNECT`: remove from hostRegistry
- `FIND_CLAIM_SLOT`: call RoomManager (atomic), broadcast `ROOM_UPDATE`, ACK with slot index
- All mutations ACK with `{ type: 'ACK', reqId, ok: true, result }` or `{ ok: false, error }`
- On WS close: `mgr.handleClientDisconnect(ws)`, clean up all subscription Sets

---

## Files to Modify

### `vite.config.js`
Add to `resolve.alias`:
```js
'@backend': process.env.BACKEND === 'websocket'
  ? fileURLToPath(new URL('./src/backend/websocket.js', import.meta.url))
  : fileURLToPath(new URL('./src/backend/firebase.js', import.meta.url))
```

### `package.json`
- Add `"ws": "^8.x"` to `dependencies`
- Add `"server": "node server/index.js"` to `scripts`

### `src/stores/roomStore.js`
- Remove: `import { ref as dbRef, set as dbSet } from 'firebase/database'`
- Remove: `import { db } from '../firebase/firebase.js'`
- Change import source from `'../firebase/roomService.js'` → `'@backend'`
- Add `joinRoomSlot` to the import list
- Line 70: replace `await dbSet(dbRef(db, 'rooms/${id}/slots/0'), hostSlot)` with `await joinRoomSlot(id, 0, hostSlot)`

### `src/stores/chatStore.js`
- Remove: `import { off } from 'firebase/database'`
- Change import source to `'@backend'`, add `unsubscribePlayerEmojis` to imports
- Line 39: `off(_emojisRef)` → `unsubscribePlayerEmojis(_emojisRef)`

### `src/services/FirebaseGameService.js`
- Remove: `import { db } from '../firebase/firebase.js'`
- Remove: `import { ref, onValue, off } from 'firebase/database'`
- Change roomService import source to `'@backend'`, add `subscribeToGameState`, `unsubscribeGameState`
- Replace `_subscribeToGameState()` body:
  ```js
  this._gsRef = subscribeToGameState(this._roomId, (data) => {
    if (data.currentPlayerIndex === this._slotIndex) this._restoreEngine(data)
    this._applySnapshot(data)
  })
  ```
- Replace `_unsubscribeGameState()` body:
  ```js
  if (this._gsRef) { unsubscribeGameState(this._gsRef); this._gsRef = null }
  ```

---

## WebSocket Protocol Summary

```
Client → Server:  { type, reqId, ...payload }
Server → Client:  { type: 'ACK', reqId, ok, result? | error }
                  { type: 'ROOM_UPDATE', roomId, data }
                  { type: 'GAMESTATE_UPDATE', roomId, data }
                  { type: 'EMOJIS_UPDATE', roomId, data }
```

---

## Environment Variables

| Var | Where | Purpose |
|---|---|---|
| `BACKEND` | shell / build | `websocket` → use WS; default → Firebase |
| `VITE_WS_URL` | `.env` | WS server URL, default `ws://localhost:8080` |
| `WS_PORT` | shell | Server port, default `8080` |

---

## Verification

1. **Firebase still works** — run `npm run dev` (no `BACKEND` set), do full lobby→game→win flow in two tabs
2. **Server starts** — `node server/index.js` → logs listening on port 8080
3. **WS lobby flow** — `BACKEND=websocket npm run dev`, create room in tab 1, join in tab 2; verify real-time slot updates
4. **Game sync** — both players mark ready, game starts; play moves; verify game state syncs turn-by-turn
5. **Emoji** — send emoji; verify appears on both clients
6. **Host disconnect** — close host tab; verify guest sees `abandoned` status, grace timer fires
7. **Reconnect re-subscription** — force-close WS in DevTools; verify auto-reconnect re-sends subscriptions and state is restored


## How to use:
