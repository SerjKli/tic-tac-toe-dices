<template>
  <div class="lang-selector">
    <button :class="{ active: locale === 'ru' }" @click="switchTo('ru')">RU</button>
    <button :class="{ active: locale === 'en' }" @click="switchTo('en')">EN</button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { setLocale } from '../i18n/index.js'

const { locale } = useI18n()

function switchTo(lang) {
  setLocale(lang)
}
</script>

<style scoped>
.lang-selector {
  display: flex;
  gap: 4px;
}

.lang-selector button {
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #888;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.lang-selector button.active {
  border-color: #3498db;
  color: #3498db;
}

.lang-selector button:hover:not(.active) {
  border-color: #aaa;
  color: #555;
}
</style>
