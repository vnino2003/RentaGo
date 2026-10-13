<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'
const reduced = useReducedMotion()
</script>
<template>
  <motion.div
    :initial="{ opacity: 0, y: reduced ? 0 : 14 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :in-view-options="{ once: true }"
    :transition="{ duration: reduced ? 0 : 0.38 }"
  >
    <slot />
  </motion.div>
</template>
