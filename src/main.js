import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { i18n } from './i18n/index.js'
import './layout.scss'
import './theme.pixel.scss'
import { gameServiceKey } from './services/serviceKeys.js'
import { LocalGameService } from './services/LocalGameService.js'
import { FirebaseGameService } from './services/FirebaseGameService.js'
import { getRoomSession, getOrCreatePlayerId } from './utils/identity.js'

const session = getRoomSession()
const urlRoom = new URLSearchParams(location.search).get('room')
const roomId = session?.roomId ?? urlRoom

const service = roomId
  ? new FirebaseGameService(roomId, getOrCreatePlayerId(), session?.slotIndex ?? null)
  : new LocalGameService()

createApp(App)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .provide(gameServiceKey, service)
  .mount('#app')
