import { createRouter, createWebHistory } from 'vue-router'
import { STORAGE_KEY } from '../services/LocalGameService.js'
import { getRoomSession } from '../utils/identity.js'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/setup', component: () => import('../views/SetupView.vue') },
  { path: '/game', component: () => import('../views/GameView.vue') },
  { path: '/lobby', component: () => import('../views/LobbyView.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  if (to.path === '/lobby' && to.query.room) {
    localStorage.removeItem(STORAGE_KEY)
  }

  if (to.path === '/') {
    const urlRoom = to.query.room
    if (urlRoom) return `/lobby?room=${urlRoom}`

    const session = getRoomSession()
    if (session) return `/lobby`

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { gameState } = JSON.parse(saved)
        if (gameState && gameState !== 'IDLE') return '/game'
      }
    } catch { /* ignore */ }
  }
})

export default router
