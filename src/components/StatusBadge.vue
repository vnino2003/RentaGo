<script setup lang="ts">
defineProps<{ status: string }>()
</script>
<template>
  <span
    class="status-pill"
    :class="{
      positive: ['Verified', 'Confirmed', 'Available', 'Completed'].includes(status),
      negative: ['Rejected', 'Cancelled', 'Unavailable'].includes(status),
    }"
  >
    <i />
    {{ status }}
  </span>
</template>
