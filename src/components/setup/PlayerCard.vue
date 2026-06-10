<template>
  <div class="player-card" :style="{ '--player-color': player.color }">
    <div class="card-header">
      <span class="player-mark">{{ player.mark }}</span>
      <span class="player-label">{{ t('setup.player', { n: index + 1 }) }}</span>

      <button class="go-random" @click="randomize">🎲 {{ t('setup.randomize') }}</button>
    </div>
    <div class="card-body">
      <label>{{ t('setup.name') }}</label>
      <input
        type="text"
        :value="player.name"
        maxlength="20"
        @input="update('name', $event.target.value)"
      />

      <label>{{ t('setup.mark') }}</label>
      <div class="mark-options">
        <button
          v-for="m in availableMarks"
          :key="m"
          class="mark-btn"
          :class="{ active: player.mark === m }"
          @click="update('mark', m)"
        >
          {{ m }}
        </button>
      </div>

      <label>{{ t('setup.color') }}</label>
      <div class="color-options">
        <button
          v-for="c in availableColors"
          :key="c"
          class="color-btn"
          :class="{ active: player.color === c }"
          :style="{ background: c }"
          @click="update('color', c)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { DEFAULT_MARKS, DEFAULT_COLORS } from '../../core/constants.js'

defineProps({
  player: { type: Object, required: true },
  index: { type: Number, required: true }
})

const emit = defineEmits(['update'])
const { t } = useI18n()

function update(key, value) {
  emit('update', { key, value })
}

function randomize() {
  const mark = availableMarks[Math.floor(Math.random() * availableMarks.length)]
  const color = availableColors[Math.floor(Math.random() * availableColors.length)]
  emit('update', { key: 'mark', value: mark })
  emit('update', { key: 'color', value: color })
}

const availableMarks = DEFAULT_MARKS
const availableColors = DEFAULT_COLORS
</script>

<style scoped>
.player-card {
  border: 2px solid var(--player-color);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  background: var(--player-color);
  color: white;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.player-mark {
  font-size: 1.4rem;
}

.go-random {
  margin-left: auto;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 6px;
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.go-random:hover {
  background: rgba(255,255,255,0.35);
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
}

input[type="text"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.mark-options,
.color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mark-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: border-color 0.15s;
}

.mark-btn.active {
  border-color: var(--player-color);
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
}

.color-btn.active {
  border-color: #333;
  transform: scale(1.15);
}
</style>
