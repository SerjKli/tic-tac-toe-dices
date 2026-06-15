<template>
  <span class="mark-item">
    <span v-if="isSprite" class="mark-item-sprite" :style="spriteCss"></span>
    <span v-else-if="isSpriteMini" class="mark-item-sprite" :style="spriteCss"></span>
    <span v-else>
      {{ mark }}
    </span>
  </span>

</template>

<script setup>

import {computed} from "vue";
import {MARKS_SPRITE, MARKS_SPRITE_MINI} from "@/core/constants.js";

const props = defineProps({
 mark: { type: String, required: true },
})

const isSprite = computed(() => {return props.mark.startsWith('m:')})
const isSpriteMini = computed(() => {return props.mark.startsWith('mn:')})

const spritePath = computed(() => {
  if(isSprite.value) return MARKS_SPRITE
  if(isSpriteMini.value) return MARKS_SPRITE_MINI
  return ''
})


const spriteCss = computed(() => {
  const [,x,y,w,h] = props.mark.split(':')

  return {
    backgroundImage: `url(${spritePath.value})`,
    backgroundSize: `${w}px ${h}px`,
    backgroundPosition: `${x}px ${y}px`,
  };
})

</script>


<style scoped>
.mark-item-sprite{
  display: inline-block;
  width: 34px;
  height: 34px;
  background-repeat: no-repeat;
}
</style>