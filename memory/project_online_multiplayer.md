---
name: project-online-multiplayer
description: Firebase RTDB online multiplayer implemented — new files, modified files, and required Firebase setup
metadata:
  type: project
---

Online multiplayer via Firebase RTDB was implemented per plan_go_online.md.

**New files:** `src/utils/identity.js`, `src/firebase/firebase.js`, `src/firebase/roomService.js`, `src/services/serviceKeys.js`, `src/services/FirebaseGameService.js`, `src/stores/roomStore.js`, `src/views/LobbyView.vue`, `.env.local` (gitignored, credentials go here).

**Modified files:** `src/main.js` (service injection), `src/stores/gameStore.js` (inject service, myTurn/isOnline computed), `src/router/index.js` (/lobby route + guard), `src/components/setup/GameSetup.vue` (mode toggle), `src/views/SetupView.vue` (online flow), `src/views/GameView.vue` (turn guard + waiting overlay), i18n locales.

**Why:** User wants to add online multiplayer while keeping offline mode intact.

**How to apply:** Firebase credentials must be filled into `.env.local` before online mode works. See Firebase Setup Instructions in plan_go_online.md.
