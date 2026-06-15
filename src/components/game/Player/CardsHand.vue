<template>
  <div class="player-cards-hand" v-if="hasCards">
    <span class="card pop-in" v-for="i in props.player.hand.length"></span>
  </div>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
  player: { type: Object, required: true }
})

const hasCards = computed(() => {return props.player.hand?.length ?? 0 > 0})
</script>

<style scoped>

</style>