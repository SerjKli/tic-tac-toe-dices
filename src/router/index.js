import { createRouter, createWebHistory } from 'vue-router'
import { STORAGE_KEY } from '../services/LocalGameService.js'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/setup', component: () => import('../views/SetupView.vue') },
  { path: '/game', component: () => import('../views/GameView.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  if (to.path === '/') {
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
