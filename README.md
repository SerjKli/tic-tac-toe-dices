# Tic-Tac-Toe

A browser-based Tic-Tac-Toe game with extended rules, built with Vue 3 + Vite.

![Game Screenshot](descriptions/game.jpeg)

## Features

- Classic Tic-Tac-Toe gameplay
- Configurable board size and winning length
- Score tracking across games
- Rule variants and power-ups

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run unit tests |
| `npm run lint` | Run ESLint |

## Stack

- **Vue 3** (Composition API)
- **Vite**
- **Pinia** (state management)
- **Vitest** (unit testing)

## Run the game:
#### Firebase backend

```
cp .evn.example .env.local
# fill firebase data 
```

```
npm run dev
# go to http://localhost:5173/ttt-6/
```

### WebSocket backend
Open two terminals
### Terminal 1
```
node server/index.js
```
### Terminal 2
```
npm run dev:ws
# go to http://localhost:5173/ttt-6/
```

or with specific server
```
VITE_WS_URL=wss://your-server npm run dev:ws
# go to http://localhost:5173/ttt-6/
```

The WS build is 204KB vs Firebase's 430KB, confirming the Firebase SDK is fully tree-shaken when unused.