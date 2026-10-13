<script setup lang="ts">
import { categories } from '../../data/cars'
const model = defineModel<string>({ default: 'All' })
</script>
<template>
  <div class="category-row" role="group" aria-label="Car categories">
    <button v-for="category in categories" :key="category" type="button" :class="{ selected: model === category }" :aria-pressed="model === category" @click="model = category">{{ category === 'All' ? 'All cars' : category }}</button>
  </div>
</template>
