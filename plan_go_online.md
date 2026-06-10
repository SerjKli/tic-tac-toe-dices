  # Online Multiplayer via Firebase RTDB

## Context

The game currently supports only local (offline) play with state persisted in localStorage. The goal is to add online multiplayer so a host can create a room, share a join link, wait for all players to arrive, then play with real-time move sync. Firebase RTDB is the sync layer. No auth is required now (anonymous identity via localStorage UUID). The offline mode stays fully intact.

---

## Firebase RTDB Data Structure

```
/rooms/{roomId}/
  meta/
    hostId: string          // UUID of creating client
    playerCount: number     // 2–5
    createdAt: number       // Date.now()
    status: 'waiting' | 'all-joined' | 'playing' | 'finished' | 'abandoned'

  slots/
    {0..N}/                 // one per playerCount
      playerId: string | null
      name: string
      mark: string          // emoji
      color: string         // hex
      ready: boolean

  gameState/                // full engine snapshot, written only by current player
    state: string           // GameState enum
    board: [[{ownerId}]]    // 6×6 grid
    currentPlayerIndex: number
    lastRoll: [number, number] | null
    lastEvaluation: { candidates, isDoubles, mustSkip } | null
    winnerIndex: number | null
    winCells: [{row, col}]
    updatedAt: number
```

---

## Room Lifecycle

```
WAITING → ALL_JOINED → PLAYING → FINISHED
                                    ↕
                               ABANDONED  (host disconnects before game)
```

- `WAITING → ALL_JOINED`: any client detects all slots filled; host writes status
- `ALL_JOINED → PLAYING`: all slots have `ready=true`; host writes `status='playing'` + initial `gameState/`, all clients navigate to `/game?room=ID`  
  *(no separate ALL_READY status — host auto-starts when everyone is ready)*
- `PLAYING → FINISHED`: current player detects `game-won`, pushes final snapshot + writes `status='finished'`

---

## New Files

### `src/utils/identity.js`
Pure localStorage helpers — no Firebase dependency.
- `getOrCreatePlayerId()` — read/write `tic-toe:playerId` (UUID v4 via `crypto.randomUUID()`)
- `generateRoomId()` — 8-char alphanumeric
- `saveRoomSession({ roomId, slotIndex })` / `getRoomSession()` / `clearRoomSession()`

### `src/firebase/firebase.js`
```js
initializeApp({ apiKey, authDomain, databaseURL, projectId, … })  // from import.meta.env.VITE_FIREBASE_*
export const db = getDatabase()
```

### `src/firebase/roomService.js`
Pure RTDB helpers (no Vue reactivity):
- `createRoom(roomId, hostId, playerCount)`
- `joinRoomSlot(roomId, slotIndex, playerData)` — uses `runTransaction` to atomically claim slot
- `findAndClaimSlot(roomId, playerData)` — finds first null slot, claims it, returns slotIndex
- `setSlotReady(roomId, slotIndex, ready)`
- `pushGameState(roomId, snapshot)`
- `setRoomStatus(roomId, status)`
- `getRoomOnce(roomId)` — one-shot `get()`
- `subscribeToRoom(roomId, cb)` / `unsubscribeRoom(ref)` — returns unsubscribe fn
- `setHostDisconnect(roomId)` — `onDisconnect(...).set('abandoned')`

### `src/services/serviceKeys.js`
```js
export const gameServiceKey = Symbol('gameService')
```

### `src/services/FirebaseGameService.js`
Implements `IGameService`. Key differences from `LocalGameService`:

- Constructor: `(roomId, playerId, slotIndex)` — `slotIndex` can be `null` before joining, set later via `setSlotIndex(n)`
- All write actions (`rollDice`, `makeMove`, `skipTurn`) guard on `this.isMyTurn` — return early if not
- `_pushSnapshot()` — serializes `engine.snapshot` → calls `roomService.pushGameState()`
- `_subscribeToGameState()` — `onValue(gameState/)`: on each update, if `currentPlayerIndex === mySlotIndex`, call `_restoreEngine(data)` to make engine authoritative; always call `_applySnapshot(data)` to update reactive state
- `_restoreEngine(data)` — directly sets `engine.state`, `engine.board`, `engine.players`, `engine.currentPlayerIndex`, `engine.lastRoll`, `engine.lastEvaluation` (same writable fields used by `LocalGameService._restore()`)
- `startGame({ players })` — only host calls this; runs engine, calls `_pushSnapshot()`
- `resetGame()` — clears `gameState/`, sets `status='finished'`, calls `clearRoomSession()`
- `isMyTurn` getter — `state.currentPlayerIndex === mySlotIndex`
- Exposes `isOnline = true` for GameView to check

### `src/stores/roomStore.js`
New Pinia store:
- State: `roomId`, `myPlayerId`, `mySlotIndex`, `slots[]`, `roomStatus`, `unsubscribe` fn
- `createRoom(playerCount)` — generates ID, writes to RTDB, sets `onDisconnect`, saves session, navigates to `/lobby?room=ID`
- `joinRoom(roomId, playerConfig)` — calls `findAndClaimSlot`, saves session, sets `mySlotIndex`
- `setReady()` — writes `slots[mySlotIndex].ready = true`; if host and all ready → calls `gameStore.startGame()` + `setRoomStatus('playing')`
- `watchRoom(roomId)` — RTDB listener; when `status='playing'` navigates all non-host clients to `/game?room=ID`
- `stopWatching()` — calls stored `unsubscribe` fn
- `isHost` computed — `myPlayerId === slots[0]?.playerId`
- `allSlotsReady` computed — all `playerCount` slots filled and all `ready=true`
- `allSlotsFilled` computed

### `src/views/LobbyView.vue`
New route `/lobby`:
- On mount: reads `?room=` query param; if new guest calls `roomStore.joinRoom()`, else restores from session; calls `roomStore.watchRoom()`
- On unmount: calls `roomStore.stopWatching()`
- Shows: room code chip + "Copy link" button, slot list with avatars and ready badges, "Waiting for players…" when not all filled, "Mark as ready" button (enabled once all slots filled), host sees auto-start indicator
- When `roomStore.roomStatus === 'playing'`, router.push(`/game?room=${roomId}`)
- Guest mini-setup form (name input + mark/color picker) shown before joining — pre-populates from settingsStore if available

---

## Modified Files

### `package.json`
Add `firebase` dependency. Run `npm install firebase`.

### `.env.local` (new, gitignored)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

### `src/main.js`
Before `mount()`, detect room session and provide the right service:
```js
import { gameServiceKey } from './services/serviceKeys.js'
const session = getRoomSession()
const urlRoom = new URLSearchParams(location.search).get('room')
const roomId = session?.roomId ?? urlRoom
const service = roomId
  ? new FirebaseGameService(roomId, getOrCreatePlayerId(), session?.slotIndex ?? null)
  : new LocalGameService()
app.provide(gameServiceKey, service)
```

### `src/stores/gameStore.js`
Replace hardcoded `new LocalGameService()` with:
```js
const service = inject(gameServiceKey, () => new LocalGameService(), true)
```
Add `myTurn` computed: `service.isOnline ? service.isMyTurn : true`  
Add `isOnline` computed: `!!service.isOnline`

### `src/router/index.js`
- Add route: `{ path: '/lobby', component: () => import('../views/LobbyView.vue') }`
- Update `beforeEach` guard:
  - If `to.path === '/'` and `?room=` present → redirect to `/lobby?room=…`
  - If `to.path === '/'` and `getRoomSession()` exists → redirect to `/lobby`
  - Existing localStorage guard for local game unchanged

### `src/components/setup/GameSetup.vue`
Add Online/Offline toggle after PlayerCountPicker. When "Online" selected, "Start Game" button text changes to "Create Room". Emit `start` with `{ mode: 'online' | 'local' }` payload.

### `src/views/SetupView.vue`
Handle `mode` in `@start` handler:
- `mode === 'local'`: existing flow unchanged
- `mode === 'online'`: call `roomStore.createRoom(settings.playerCount)` (navigates to lobby internally)

### `src/views/GameView.vue`
- Wrap dice roll and cell click handlers: `if (game.myTurn || !game.isOnline) { ... }`
- Add "Waiting for [player name]…" overlay when `game.isOnline && !game.myTurn`
- In `onUnmounted`: call `roomStore.stopWatching()`

### `src/i18n/locales/en.js` + `ru.js`
Add keys: `lobby.waitingForPlayers`, `lobby.copyLink`, `lobby.roomCode`, `lobby.markReady`, `lobby.allReady`, `setup.modeOnline`, `setup.modeLocal`, `game.waitingForPlayer`

---

## Service Injection Notes

`inject(gameServiceKey)` inside `defineStore(() => { … })` works because Pinia composition stores run in a component setup context. The `LocalGameService` default fallback ensures offline mode continues working without any `app.provide` call.

---

## Player Identity & Rejoin

- Identity: `crypto.randomUUID()` stored in `tic-toe:playerId` localStorage key, generated once per browser
- Room session: `tic-toe:roomSession = { roomId, slotIndex }` — written on create/join, cleared on `resetGame()`
- Rejoin flow: on `LobbyView` mount with existing session, call `roomService.getRoomOnce(roomId)` — if slot still owned by `myPlayerId` and status is `playing`, navigate straight to `/game?room=ID` and `FirebaseGameService` subscribes to existing `gameState/`

---

## Edge Cases Covered

- **Slot race:** `findAndClaimSlot` uses `runTransaction` — atomic, prevents two guests claiming the same slot
- **Host disconnect (lobby):** `onDisconnect` writes `status='abandoned'`; other clients watch and show error + redirect to `/`
- **Dice non-determinism:** Only current player calls `engine.rollDice()`; result travels via RTDB snapshot — never re-rolled by observers
- **Extra turn (doubles):** `currentPlayerIndex` stays same in snapshot; FirebaseGameService correctly keeps ownership on same player
- **Mid-turn rejoin:** `CHOOSING` state + `lastEvaluation` are in snapshot; `_restoreEngine()` restores them so candidate cells re-appear

---

## Firebase Setup Instructions (for user)

1. Go to [console.firebase.google.com](https://console.firebase.google.com), create a project
2. Enable **Realtime Database** (start in test mode for development)
3. Copy the SDK config snippet to `.env.local`
4. Add RTDB security rules (provided in plan — deny writes unless player owns the slot)

---

## Verification

1. `npm run dev` — open two tabs
2. Tab 1: Setup → Online → Create Room → see lobby with room code
3. Tab 2: navigate to `/lobby?room=CODE` → see guest form → enter name → click Ready
4. Tab 1: click Ready → game starts, both tabs navigate to `/game`
5. Tab 1 (host/player 0): roll dice, make move — Tab 2 updates in real time, interactions disabled
6. Tab 2's turn: Tab 1 cannot interact; Tab 2 rolls and moves
7. Reload Tab 2 mid-game → rejoins and continues
8. Offline mode: Setup → Local → unchanged behavior

---

## Implementation Order

1. `src/utils/identity.js`
2. `src/firebase/firebase.js` + `.env.local`
3. `src/firebase/roomService.js`
4. `src/services/serviceKeys.js`
5. `src/services/FirebaseGameService.js`
6. `src/stores/roomStore.js`
7. `src/views/LobbyView.vue`
8. `src/main.js` — service detection + `app.provide`
9. `src/stores/gameStore.js` — inject service
10. `src/router/index.js` — new route + updated guard
11. `src/components/setup/GameSetup.vue` — mode toggle
12. `src/views/SetupView.vue` — online flow
13. `src/views/GameView.vue` — turn guard + waiting overlay
14. i18n keys
