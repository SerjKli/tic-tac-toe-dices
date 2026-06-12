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
.player-cards-hand{
  position: absolute;
  top: -12px;
  right: 0;
}
.player-cards-hand .card{
  width: 14px;
  height: 21px;
  display: inline-block;
  background-color: #d4d4d4;
  border-radius: 3px;
  border: 1px solid #ababab;
  margin-left: 3px;
}
.player-cards-hand .card::after{
  content: "";
  width: 8px;
  height: 16px;
  background-color: #f6f6f6;
  clip-path: polygon(
      50% 0%,
      100% 50%,
      50% 100%,
      0% 50%
  );
  display: block;
  position: absolute;
  top: calc(50% - 8px);
  left: calc(50% - 4px);
}
</style>