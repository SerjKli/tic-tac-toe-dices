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
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.hero {
  max-width: 520px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

h1 {
  font-size: 3.5rem;
  margin: 0;
  line-height: 1.1;
}

p {
  margin: 0;
  color: #555;
  font-size: 1.1rem;
}

.rule-list {
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-list li::before {
  content: '→ ';
  color: #3498db;
  font-weight: 700;
}

</style>
