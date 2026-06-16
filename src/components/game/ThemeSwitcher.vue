<template>
  <div class="theme-switcher">
    <button
      v-for="t in THEMES"
      :key="t.id"
      class="theme-btn"
      :class="{ active: settings.theme === t.id }"
      :title="t.label"
      @click="selectTheme(t.id)"
    >
      <span class="theme-dot" :style="{ background: t.color }"></span>
      <span class="theme-label">{{ t.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { useTheme, THEMES } from '@/composables/useTheme.js'
const { settings, selectTheme } = useTheme()
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 4px;
}

.theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 5px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #2c2a4a;
  background: #fffdf5;
  border: 3px solid #2c2a4a;
  box-shadow: 2px 2px 0 #2c2a4a;
  cursor: pointer;
  transition: transform 0.08s, box-shadow 0.08s;
  user-select: none;
}

.theme-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #2c2a4a;
}

.theme-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #2c2a4a;
}

.theme-btn.active {
  background: #2c2a4a;
  color: #fffdf5;
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #2c2a4a;
}

.theme-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border: 2px solid currentColor;
  flex-shrink: 0;
}
</style>
