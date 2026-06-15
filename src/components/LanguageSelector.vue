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
</style>
