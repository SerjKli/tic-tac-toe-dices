# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based Tic-Tac-Toe game with extended rules, built with Vue 3 + Vite.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173
npm run build        # production build to dist/
npm run preview      # preview production build
npm run test:unit    # run Vitest unit tests
npm run lint         # ESLint
```

## Stack

- **Vue 3** (Composition API with `<script setup>`)
- **Vite** for bundling and dev server
- **Vitest** for unit tests
- **Pinia** for game state management (board, turn, scores, rule variants)

## Architecture

Game logic lives in a Pinia store (`src/stores/game.js`), keeping Vue components as pure presentation. Components handle only rendering and user input; all win detection, turn management, and rule enforcement belong in the store.

Rule variants (e.g. board size, winning length, power-ups, time limits) should be implemented as configurable options in the store, not as branching logic scattered across components.
