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
  font-family: var(--px-font-pixel);
  font-size: 11px;
  color: var(--px-dark);
  background: var(--px-cream);
  border: var(--px-border-sm);
  box-shadow: var(--px-shadow-sm);
  cursor: pointer;
  transition: var(--px-transition);
  user-select: none;
}

.theme-btn:hover {
  box-shadow: var(--px-shadow);
}

.theme-btn:active {
  box-shadow: var(--px-shadow-zero);
}

.theme-btn.active {
  background: var(--px-dark);
  color: var(--px-cream);
  box-shadow: var(--px-shadow-zero);
}

.theme-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border: 2px solid currentColor;
  border-radius: 50%;
  flex-shrink: 0;
}

.theme-btn.active .theme-dot {
  border-color: var(--px-cream);
}
</style>
