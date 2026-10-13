<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { checkmarkCircleOutline, timeOutline } from 'ionicons/icons'
import type { BookingPreview } from '../../types/car'

defineProps<{
  booking: BookingPreview
}>()
</script>

<template>
  <article class="booking-card">
    <div>
      <p>{{ booking.id }}</p>
      <h2>{{ booking.carName }}</h2>
      <span>{{ booking.dateRange }}</span>
    </div>
    <div class="booking-card__status" :class="booking.status.toLowerCase()">
      <ion-icon :icon="booking.status === 'Confirmed' ? checkmarkCircleOutline : timeOutline" />
      {{ booking.status }}
    </div>
    <strong>PHP {{ booking.total.toLocaleString() }}</strong>
  </article>
</template>
