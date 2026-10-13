<script setup lang="ts">
defineProps<{ labels: string[]; current: number }>()
</script>
<template>
  <ol class="flow-steps">
    <li
      v-for="(label, index) in labels"
      :key="label"
      :class="{ current: index === current, done: index < current }"
      :aria-current="index === current ? 'step' : undefined"
    >
      <span>{{ index + 1 }}</span>
      {{ label }}
    </li>
  </ol>
</template>
