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
</style>
