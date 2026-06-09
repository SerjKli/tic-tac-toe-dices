import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEFAULT_MARKS, DEFAULT_COLORS, MIN_PLAYERS } from '../core/constants.js'
import { Player } from '../core/models/Player.js'

export const useSettingsStore = defineStore('settings', () => {
  const playerCount = ref(MIN_PLAYERS)
  const players = ref(buildDefaultPlayers(MIN_PLAYERS))
  const theme = ref('default')

  function buildDefaultPlayers(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      mark: DEFAULT_MARKS[i],
      color: DEFAULT_COLORS[i]
    }))
  }

  function setPlayerCount(count) {
    playerCount.value = count
    const current = players.value
    players.value = Array.from({ length: count }, (_, i) =>
      current[i] ?? {
        id: `p${i + 1}`,
        name: `Player ${i + 1}`,
        mark: DEFAULT_MARKS[i],
        color: DEFAULT_COLORS[i]
      }
    )
  }

  function updatePlayer(index, patch) {
    players.value[index] = { ...players.value[index], ...patch }
  }

  const playerObjects = computed(() =>
    players.value.map(p => new Player(p))
  )

  return { playerCount, players, theme, setPlayerCount, updatePlayer, playerObjects }
})
