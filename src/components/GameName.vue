<template>
  <h1>{{t('gameName')}}<br/><span class="six">{{t('gameNameSubtitle')}}</span></h1>
</template>

<script setup>
import {useI18n} from "vue-i18n";

const { t } = useI18n()
</script>



<style scoped>

.six {
  color: #3498db;
}

</style>