<template>
  <div class="px-card">
    <!-- header -->
    <div class="px-header" :style="{ background: player.color }">
      <div class="px-mark-tile">{{ player.mark }}</div>
      <div class="px-player-label">PLAYER {{ index + 1 }}</div>
      <button class="px-random-btn" @click="randomize">
        <span class="die-spin">🎲</span> RANDOM
      </button>
    </div>

    <!-- body -->
    <div class="px-body">
      <div class="px-field-label">NAME</div>
      <input
        class="px-input"
        type="text"
        :value="player.name"
        maxlength="20"
        @input="update('name', $event.target.value)"
      />

      <div class="px-field-label">MARK</div>
      <div class="marks-grid">
        <div
          v-for="m in availableMarks"
          :key="m"
          class="mark-tile"
          @click="update('mark', m)"
        >
          {{ m }}
          <div v-if="player.mark === m" class="mark-sel-ring"></div>
        </div>
      </div>

      <div class="px-field-label">COLOR</div>
      <div class="colors-grid">
        <div
          v-for="c in availableColors"
          :key="c"
          class="color-swatch"
          :style="{ background: c }"
          @click="update('color', c)"
        >
          <div v-if="player.color === c" class="color-sel-ring"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DEFAULT_MARKS, DEFAULT_COLORS } from '@/core/constants.js'

defineProps({
  player: { type: Object, required: true },
  index: { type: Number, required: true }
})

const emit = defineEmits(['update'])

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
.px-card {
  border: 4px solid #2c2a4a;
  background: #fffdf5;
  box-shadow: 6px 6px 0 #2c2a4a;
}

/* ── header ── */
.px-header {
  padding: 13px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 4px solid #2c2a4a;
}

.px-mark-tile {
  width: 46px;
  height: 46px;
  background: #fffdf5;
  border: 3px solid #2c2a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 2px 2px 0 #2c2a4a;
  flex-shrink: 0;
}

.px-player-label {
  flex: 1;
  font-family: 'Press Start 2P', monospace;
  font-size: 13px;
  color: #fff;
  text-shadow: 2px 2px 0 #2c2a4a;
}

.px-random-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #2c2a4a;
  background: #fffdf5;
  border: 3px solid #2c2a4a;
  box-shadow: 2px 2px 0 #2c2a4a;
  padding: 8px 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: transform 0.08s, box-shadow 0.08s;
}

.px-random-btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 #2c2a4a; }

.die-spin {
  font-size: 13px;
  display: inline-block;
  animation: px-spin 1.6s ease-in-out infinite;
}

/* ── body ── */
.px-body {
  padding: 18px;
}

.px-field-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #7d7a96;
  margin-bottom: 9px;
}

.px-input {
  width: 100%;
  font-family: 'VT323', monospace;
  font-size: 24px;
  color: #2c2a4a;
  background: #fff;
  border: 3px solid #2c2a4a;
  box-shadow: 2px 2px 0 #2c2a4a;
  padding: 9px 12px 5px;
  outline: none;
  margin-bottom: 20px;
}

/* ── mark picker ── */
.marks-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 7px;
  margin-bottom: 22px;
}

.mark-tile {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  background: #fff;
  border: 3px solid #2c2a4a;
  box-shadow: 2px 2px 0 #2c2a4a;
  cursor: pointer;
}

.mark-sel-ring {
  position: absolute;
  inset: -3px;
  border: 4px solid #ffd23f;
  box-shadow: 0 0 0 2px #2c2a4a;
  pointer-events: none;
}

/* ── color swatches ── */
.colors-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.color-swatch {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border: 3px solid #2c2a4a;
  box-shadow: 2px 2px 0 #2c2a4a;
  cursor: pointer;
}

.color-sel-ring {
  position: absolute;
  inset: -5px;
  border: 4px solid #2c2a4a;
  box-shadow: inset 0 0 0 2px #fff;
  pointer-events: none;
}
</style>
