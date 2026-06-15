<template>
  <ViewWrapper class="home">
    <LanguageSelector class="lang-pos" />

    <div class="hero">
      <GameName/>
      <p>{{ t('home.tagline') }}</p>
      <ul class="rule-list">
        <li>{{ t('home.rule1') }}</li>
        <li>{{ t('home.rule2') }}</li>
        <li>{{ t('home.rule3') }}</li>
        <li>{{ t('home.rule4') }}</li>
      </ul>
      <router-link to="/setup" class="action-btn btn-primary">{{ t('home.playNow') }}</router-link>
    </div>
  </ViewWrapper>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSelector from '../components/LanguageSelector.vue'
import GameName from '../components/GameName.vue'
import ViewWrapper from '../components/ViewWrapper.vue'

const { t } = useI18n()
</script>

<style scoped>
</style>
