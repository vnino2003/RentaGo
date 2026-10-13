<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import {
  peopleOutline,
  star,
  speedometerOutline,
  heartOutline,
  heart,
  arrowForwardOutline,
  locationOutline,
} from 'ionicons/icons'
import { useSavedCars } from '../../composables/useSavedCars'
import type { Car } from '../../types/car'
import { rental } from '../../stores/rental'
import { available } from '../../services/mockApi'
import StatusBadge from '../StatusBadge.vue'
defineProps<{ car: Car }>()
const { saved, toggle } = useSavedCars()
</script>
<template>
  <article class="car-card">
    <div class="car-card__media">
      <router-link :to="`/cars/${car.id}`" :aria-label="`View ${car.brand} ${car.name}`">
        <img :src="car.imageUrl" :alt="`${car.brand} ${car.name}`" loading="lazy" />
      </router-link>
      <span class="car-badge">{{ car.category }}</span>
      <button
        class="save-button"
        :aria-label="`${saved.includes(car.id) ? 'Unsave' : 'Save'} ${car.name}`"
        :title="saved.includes(car.id) ? 'Remove from saved cars' : 'Save car'"
        :aria-pressed="saved.includes(car.id)"
        @click="toggle(car.id)"
      >
        <ion-icon :icon="saved.includes(car.id) ? heart : heartOutline" />
      </button>
    </div>
    <div class="car-card__body">
      <StatusBadge
        :status="
          available(car.id, rental.draft.pickup, rental.draft.returnDate)
            ? 'Available'
            : 'Unavailable'
        "
      />
      <div class="car-card__title-row">
        <div>
          <p>{{ car.brand }}</p>
          <h2>{{ car.name }}</h2>
        </div>
        <span class="rating">
          <ion-icon :icon="star" />
          {{ car.rating }}
        </span>
      </div>
      <div class="spec-row">
        <span>
          <ion-icon :icon="peopleOutline" />
          {{ car.seats }} seats
        </span>
        <span>
          <ion-icon :icon="speedometerOutline" />
          {{ car.transmission }}
        </span>
      </div>
      <p class="car-location">
        <ion-icon :icon="locationOutline" />
        {{ car.location }}
      </p>
      <div class="car-card__footer">
        <strong>
          PHP {{ car.pricePerDay.toLocaleString() }}
          <small>/ day</small>
        </strong>
        <router-link :to="`/cars/${car.id}`" class="view-car" :aria-label="`View ${car.name}`">
          View car
          <ion-icon :icon="arrowForwardOutline" />
        </router-link>
      </div>
    </div>
  </article>
</template>
