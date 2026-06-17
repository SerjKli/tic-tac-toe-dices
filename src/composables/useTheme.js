import { watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore.js'

export const THEMES = [
  { id: 'pixel',      label: 'Pixel',   color: '#9d7be0' },
  { id: 'classic',    label: 'Classic', color: '#2563eb' },
  { id: 'dark-pixel', label: 'Dark-Neon',    color: '#2d8cff' },
]

const devThemeModules = import.meta.env.DEV
  ? import.meta.glob('/src/styles/theme.*.js')
  : null

async function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id)
  if (import.meta.env.DEV) {
    const loader = devThemeModules?.[`/src/styles/theme.${id}.js`]
    if (loader) await loader()
  } else {
    document.getElementById('app-theme')?.remove()
    const link = document.createElement('link')
    link.id = 'app-theme'
    link.rel = 'stylesheet'
    link.href = `${import.meta.env.BASE_URL}themes/${id}.css`
    document.head.appendChild(link)
  }
}

export function useTheme() {
  const settings = useSettingsStore()

  function selectTheme(id) {
    settings.theme = id
    localStorage.setItem('app-theme', id)
  }

  onMounted(() => applyTheme(settings.theme))
  watch(() => settings.theme, applyTheme)

  return { settings, selectTheme }
}
