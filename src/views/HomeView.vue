<template>
  <div class="home">
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
      <router-link to="/setup" class="play-btn">{{ t('home.playNow') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSelector from '../components/LanguageSelector.vue'
import GameName from '../components/GameName.vue'

const { t } = useI18n()
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
}

.lang-pos {
  position: absolute;
  top: 20px;
  right: 20px;
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

.play-btn {
  display: inline-block;
  padding: 14px 40px;
  font-size: 1.2rem;
  font-weight: 700;
  background: #3498db;
  color: #fff;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.15s;
}

.play-btn:hover {
  background: #2980b9;
}
</style>
